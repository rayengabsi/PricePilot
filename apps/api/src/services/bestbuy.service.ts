/**
 * Best Buy API Service
 * Handles integration with Best Buy API for product search and price updates
 */

import { BestBuyApiResponse, BestBuyProduct, Product, Price } from '../types';
import prisma from './database.service';

const BESTBUY_API_KEY = process.env.BESTBUY_API_KEY;
const BESTBUY_BASE_URL = process.env.BESTBUY_BASE_URL || 'https://api.bestbuy.com/v1';

// Throttle: max 4 requests per second (250ms minimum between calls)
const MIN_MS_BETWEEN_CALLS = 250;
let lastCallTime = 0;

const waitForThrottle = (): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();
    const elapsed = now - lastCallTime;
    const waitMs = Math.max(0, MIN_MS_BETWEEN_CALLS - elapsed);
    if (waitMs > 0) {
      setTimeout(() => {
        lastCallTime = Date.now();
        resolve();
      }, waitMs);
    } else {
      lastCallTime = Date.now();
      resolve();
    }
  });
};

// Daily rate limit (optional safety)
let dailyApiCalls = 0;
const MAX_DAILY_CALLS = 5000;
const RATE_LIMIT_RESET_HOUR = 0;

const trackApiCall = (): boolean => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  if (currentHour === RATE_LIMIT_RESET_HOUR && dailyApiCalls > 0) {
    dailyApiCalls = 0;
  }
  if (dailyApiCalls >= MAX_DAILY_CALLS) {
    console.warn(`[Best Buy] Daily rate limit reached: ${dailyApiCalls}/${MAX_DAILY_CALLS}`);
    return false;
  }
  dailyApiCalls++;
  return true;
};

/**
 * Get current API usage
 */
export const getApiUsage = (): { calls: number; limit: number; remaining: number } => {
  return {
    calls: dailyApiCalls,
    limit: MAX_DAILY_CALLS,
    remaining: MAX_DAILY_CALLS - dailyApiCalls
  };
};

/**
 * Test Best Buy API connectivity (for /api/health/bestbuy).
 * Does one minimal request; does not count toward search throttling in a heavy way.
 */
export const checkBestBuyConnectivity = async (): Promise<{ ok: boolean; message?: string; error?: string }> => {
  if (!BESTBUY_API_KEY) {
    return { ok: false, message: 'BESTBUY_API_KEY is not configured', error: 'missing_key' };
  }
  try {
    const url = `${BESTBUY_BASE_URL}/products(search=test)?apiKey=${BESTBUY_API_KEY}&format=json&pageSize=1`;
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return { ok: false, message: `API returned ${response.status}`, error: text.slice(0, 100) };
    }
    const data = (await response.json()) as BestBuyApiResponse & { error?: string };
    if (data.error) {
      return { ok: false, message: data.error, error: 'api_error' };
    }
    return { ok: true, message: 'Best Buy API reachable' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg, error: 'network_or_error' };
  }
};

/**
 * Transform Best Buy product to API Product format in memory (no database write).
 * Used by search only; read-only.
 */
function transformBestBuyToProductReadOnly(bbProduct: BestBuyProduct): Product {
  const category = bbProduct.categoryPath && bbProduct.categoryPath.length > 0
    ? bbProduct.categoryPath[bbProduct.categoryPath.length - 1].name
    : 'Electronics';
  const brand = bbProduct.brand || extractBrandFromName(bbProduct.name);
  const price = bbProduct.salePrice ?? bbProduct.regularPrice ?? 0;
  const now = new Date().toISOString();
  return {
    id: `bestbuy-${bbProduct.sku}`,
    name: bbProduct.name,
    description: bbProduct.longDescription || bbProduct.shortDescription || '',
    category,
    brand,
    imageUrl: bbProduct.image || undefined,
    prices: [{
      store: 'Best Buy',
      price,
      currency: 'USD',
      url: bbProduct.url,
      inStock: bbProduct.onlineAvailability !== false,
      lastUpdated: now
    }]
  };
}

/**
 * Search products on Best Buy API (read-only, no database).
 * Throttled to max 4 requests per second.
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
  if (!BESTBUY_API_KEY) {
    throw new Error('BESTBUY_API_KEY is not configured');
  }

  if (!trackApiCall()) {
    throw new Error('Best Buy API rate limit exceeded');
  }

  await waitForThrottle();

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `${BESTBUY_BASE_URL}/products(search=${searchQuery})?apiKey=${BESTBUY_API_KEY}&format=json&pageSize=${limit}`;

    console.log(`🔍 [Best Buy] Searching for: ${query}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Best Buy] API error ${response.status}:`, errorText.slice(0, 200));
      throw new Error(`Best Buy API error: ${response.status}`);
    }

    const data = (await response.json()) as BestBuyApiResponse & { error?: string };

    if (data.error) {
      console.warn('[Best Buy] API returned error:', data.error);
      return [];
    }

    const rawProducts = Array.isArray(data.products) ? data.products : [];
    console.log(`✅ [Best Buy] Returned ${rawProducts.length} products (total: ${(data as BestBuyApiResponse).total ?? '?'})`);

    return rawProducts.map((bbProduct: BestBuyProduct) => transformBestBuyToProductReadOnly(bbProduct));
  } catch (error) {
    console.error('[Best Buy] Search failed:', error);
    throw error;
  }
};

/**
 * Get a single product by SKU from Best Buy API
 */
export const getProductBySku = async (sku: string): Promise<Product> => {
  if (!BESTBUY_API_KEY) {
    throw new Error('BESTBUY_API_KEY is not configured');
  }

  if (!trackApiCall()) {
    throw new Error('Best Buy API rate limit exceeded');
  }

  try {
    const url = `${BESTBUY_BASE_URL}/products/${sku}.json?apiKey=${BESTBUY_API_KEY}`;

    console.log(`🔍 Fetching Best Buy product SKU: ${sku}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with SKU ${sku} not found`);
      }
      const errorText = await response.text();
      throw new Error(`Best Buy API error: ${response.status} - ${errorText}`);
    }

    const bbProduct = await response.json() as BestBuyProduct;
    
    console.log(`✅ Best Buy API returned product: ${bbProduct.name}`);

    return await transformBestBuyToProduct(bbProduct);
  } catch (error) {
    console.error('Error fetching Best Buy product:', error);
    throw error;
  }
};

/**
 * Transform Best Buy product to our Product format
 * Also saves/updates the product in our database
 */
export const transformBestBuyToProduct = async (bbProduct: BestBuyProduct): Promise<Product> => {
  try {
    // Extract category from categoryPath
    const category = bbProduct.categoryPath && bbProduct.categoryPath.length > 0
      ? bbProduct.categoryPath[bbProduct.categoryPath.length - 1].name
      : 'Electronics';

    // Extract brand from product name or use brand field
    const brand = bbProduct.brand || extractBrandFromName(bbProduct.name);

    // Check if product already exists in database (by name or external SKU)
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { equals: bbProduct.name, mode: 'insensitive' } },
          { description: { contains: `SKU: ${bbProduct.sku}`, mode: 'insensitive' } }
        ]
      },
      include: {
        prices: {
          where: {
            store: 'Best Buy'
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    });

    // Create or update product
    // Ensure SKU is in description for future lookups
    const baseDescription = bbProduct.longDescription || bbProduct.shortDescription || '';
    const descriptionWithSku = baseDescription.includes(`SKU: ${bbProduct.sku}`)
      ? baseDescription
      : `${baseDescription}\n\nBest Buy SKU: ${bbProduct.sku}`;

    const productData = {
      name: bbProduct.name,
      description: descriptionWithSku.trim(),
      category,
      brand,
      imageUrl: bbProduct.image || undefined
    };

    if (product) {
      // Update existing product
      product = await prisma.product.update({
        where: { id: product.id },
        data: productData,
        include: {
          prices: {
            where: {
              store: 'Best Buy'
            },
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        }
      });
    } else {
      // Create new product
      product = await prisma.product.create({
        data: productData,
        include: {
          prices: {
            where: {
              store: 'Best Buy'
            },
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        }
      });
    }

    // Check if we need to create/update price
    const currentPrice = bbProduct.salePrice || bbProduct.regularPrice || 0;
    const lastPrice = product.prices[0];
    const priceChanged = !lastPrice || Number(lastPrice.price) !== currentPrice;

    // Only create new price entry if price changed or no price exists
    if (priceChanged || !lastPrice) {
      await prisma.price.create({
        data: {
          productId: product.id,
          price: currentPrice.toString(),
          currency: 'USD',
          store: 'Best Buy',
          storeUrl: bbProduct.url,
          inStock: bbProduct.onlineAvailability !== false,
          timestamp: new Date()
        }
      });
    }

    // Fetch updated product with all prices
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        prices: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!updatedProduct) {
      throw new Error('Failed to retrieve updated product');
    }

    // Format product for response
    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description || '',
      category: updatedProduct.category,
      brand: updatedProduct.brand,
      imageUrl: updatedProduct.imageUrl || undefined,
      prices: updatedProduct.prices.map(p => ({
        store: p.store,
        price: Number(p.price),
        currency: p.currency,
        url: p.storeUrl || '',
        inStock: p.inStock,
        lastUpdated: p.timestamp.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error transforming Best Buy product:', error);
    throw error;
  }
};

/**
 * Extract brand from product name (simple heuristic)
 */
const extractBrandFromName = (name: string): string => {
  const commonBrands = ['Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Dell', 'HP', 'Lenovo', 'Nintendo', 'PlayStation', 'Xbox'];
  
  for (const brand of commonBrands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Return first word as brand if no match
  const words = name.split(' ');
  return words[0] || 'Unknown';
};

/**
 * Update prices for all Best Buy products in database
 * This is called by the scheduler to keep prices up to date
 */
export const updateBestBuyPrices = async (): Promise<{ updated: number; errors: number }> => {
  let updated = 0;
  let errors = 0;

  try {
    // Get all products that have Best Buy prices
    const productsWithBestBuy = await prisma.product.findMany({
      where: {
        prices: {
          some: {
            store: 'Best Buy'
          }
        }
      },
      include: {
        prices: {
          where: {
            store: 'Best Buy'
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    });

    console.log(`🔄 Updating prices for ${productsWithBestBuy.length} Best Buy products...`);

    for (const product of productsWithBestBuy) {
      try {
        // Check rate limit before each call
        if (!trackApiCall()) {
          console.warn('⚠️  Best Buy API rate limit reached during price update');
          break;
        }

        // Extract SKU from description
        const skuMatch = product.description?.match(/SKU:\s*(\d+)/i) || 
                        product.description?.match(/Best Buy SKU:\s*(\d+)/i);
        if (!skuMatch) {
          console.warn(`⚠️  No SKU found for product: ${product.name}`);
          continue;
        }

        const sku = skuMatch[1];
        
        // Fetch product from Best Buy API
        const url = `${BESTBUY_BASE_URL}/products/${sku}.json?apiKey=${BESTBUY_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`⚠️  Product SKU ${sku} not found on Best Buy`);
            continue;
          }
          throw new Error(`Best Buy API error: ${response.status}`);
        }

        const bbProduct = await response.json() as BestBuyProduct;
        
        // Update price if changed
        const currentPrice = bbProduct.salePrice || bbProduct.regularPrice || 0;
        const lastPrice = product.prices[0];
        const priceChanged = !lastPrice || Number(lastPrice.price) !== currentPrice;

        if (priceChanged || !lastPrice) {
          await prisma.price.create({
            data: {
              productId: product.id,
              price: currentPrice.toString(),
              currency: 'USD',
              store: 'Best Buy',
              storeUrl: bbProduct.url,
              inStock: bbProduct.onlineAvailability !== false,
              timestamp: new Date()
            }
          });
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error updating price for product ${product.name}:`, error);
        errors++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Best Buy price update completed: ${updated} updated, ${errors} errors`);
    return { updated, errors };
  } catch (error) {
    console.error('Error in updateBestBuyPrices:', error);
    throw error;
  }
};
