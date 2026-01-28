/**
 * Best Buy API Service
 * Handles integration with Best Buy API for product search and price updates
 */

import { BestBuyApiResponse, BestBuyProduct, Product, Price } from '../types';
import prisma from './database.service';

const BESTBUY_API_KEY = process.env.BESTBUY_API_KEY;
const BESTBUY_BASE_URL = process.env.BESTBUY_BASE_URL || 'https://api.bestbuy.com/v1';

// Rate limiting tracking
let dailyApiCalls = 0;
const MAX_DAILY_CALLS = 5000;
const RATE_LIMIT_RESET_HOUR = 0; // Reset at midnight UTC

/**
 * Track API usage and check rate limits
 */
const trackApiCall = (): boolean => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  // Reset counter at midnight UTC
  if (currentHour === RATE_LIMIT_RESET_HOUR && dailyApiCalls > 0) {
    dailyApiCalls = 0;
    console.log('🔄 Best Buy API rate limit counter reset');
  }
  
  if (dailyApiCalls >= MAX_DAILY_CALLS) {
    console.warn(`⚠️  Best Buy API rate limit reached: ${dailyApiCalls}/${MAX_DAILY_CALLS} calls today`);
    return false;
  }
  
  dailyApiCalls++;
  console.log(`📊 Best Buy API calls today: ${dailyApiCalls}/${MAX_DAILY_CALLS}`);
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
 * Search products on Best Buy API
 */
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
  if (!BESTBUY_API_KEY) {
    throw new Error('BESTBUY_API_KEY is not configured');
  }

  if (!trackApiCall()) {
    throw new Error('Best Buy API rate limit exceeded');
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `${BESTBUY_BASE_URL}/products(search=${searchQuery})?apiKey=${BESTBUY_API_KEY}&format=json&pageSize=${limit}`;

    console.log(`🔍 Searching Best Buy API for: ${query}`);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Best Buy API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as BestBuyApiResponse;
    
    console.log(`✅ Best Buy API returned ${data.products.length} products (total: ${data.total})`);

    // Transform Best Buy products to our format
    const products = await Promise.all(
      data.products.map(bbProduct => transformBestBuyToProduct(bbProduct))
    );

    return products;
  } catch (error) {
    console.error('Error searching Best Buy API:', error);
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
