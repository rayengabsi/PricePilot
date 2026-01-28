/**
 * Product Controller
 * Handles all product-related endpoints
 */

import { Request, Response } from 'express';
import prisma from '../services/database.service';
import { Product, CompareRequest, CompareResponse, Price } from '../types';

/**
 * Helper function to convert Prisma product to API format
 */
const formatProduct = (prismaProduct: any): Product => {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    description: prismaProduct.description,
    category: prismaProduct.category,
    brand: prismaProduct.brand,
    imageUrl: prismaProduct.imageUrl || undefined,
    specifications: prismaProduct.specifications as Record<string, string> | undefined,
    prices: prismaProduct.prices.map((p: any): Price => ({
      store: p.store,
      price: Number(p.price),
      currency: p.currency,
      url: p.storeUrl,
      inStock: p.inStock,
      lastUpdated: p.timestamp.toISOString()
    }))
  };
};
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieves a list of all available products with their prices from multiple stores
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedProducts = products.map(formatProduct);

    res.json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     description: Retrieves detailed information about a specific product including prices from all available stores
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique product identifier
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Successfully retrieved product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
      return;
    }

    res.json({
      success: true,
      data: formatProduct(product)
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search products
 *     description: Search for products by name, description, or brand. Supports filtering by category and price range.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string (searches in product name, description, and brand)
 *         example: "iphone"
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by product category
 *         example: "Smartphones"
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum price filter
 *         example: 500
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum price filter
 *         example: 1500
 *     responses:
 *       200:
 *         description: Successfully retrieved search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Bad request - missing or invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
      return;
    }

    const searchTerm = q.toLowerCase();

    // Build Prisma query
    const where: any = {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { brand: { contains: searchTerm, mode: 'insensitive' } }
      ]
    };

    // Filter by category if provided
    if (category && typeof category === 'string') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Get all products matching search criteria
    let products = await prisma.product.findMany({
      where,
      include: {
        prices: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    // Filter by price range if provided (post-query filtering for price ranges)
    if (minPrice || maxPrice) {
      products = products.filter(product => {
        if (product.prices.length === 0) return false;
        
        const prices = product.prices.map(p => Number(p.price));
        const minProductPrice = Math.min(...prices);
        const maxProductPrice = Math.max(...prices);

        if (minPrice && typeof minPrice === 'string') {
          const min = parseFloat(minPrice);
          if (maxProductPrice < min) return false;
        }

        if (maxPrice && typeof maxPrice === 'string') {
          const max = parseFloat(maxPrice);
          if (minProductPrice > max) return false;
        }

        return true;
      });
    }

    const formattedProducts = products.map(formatProduct);

    res.json({
      success: true,
      query: q,
      count: formattedProducts.length,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/compare:
 *   post:
 *     summary: Compare multiple products
 *     description: Compare prices across multiple products and find the cheapest option. Returns detailed comparison including price ranges and best deals.
 *     tags: [Compare]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompareRequest'
 *           example:
 *             productIds: ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
 *     responses:
 *       200:
 *         description: Successfully compared products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompareResponse'
 *       400:
 *         description: Bad request - invalid or empty productIds array
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No valid products found for comparison
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds }: CompareRequest = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'productIds array is required and must not be empty'
      });
      return;
    }

    // Find all requested products from database
    const prismaProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        prices: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (prismaProducts.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No valid products found for comparison'
      });
      return;
    }

    const products = prismaProducts.map(formatProduct);

    // Find the cheapest price across all products
    let cheapest = {
      productId: products[0].id,
      store: products[0].prices[0]?.store || '',
      price: products[0].prices[0]?.price || Infinity
    };

    // Calculate price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach(product => {
      product.prices.forEach(price => {
        if (price.price < cheapest.price) {
          cheapest = {
            productId: product.id,
            store: price.store,
            price: price.price
          };
        }

        minPrice = Math.min(minPrice, price.price);
        maxPrice = Math.max(maxPrice, price.price);
      });
    });

    const response: CompareResponse = {
      products,
      comparison: {
        cheapest,
        priceRange: {
          min: minPrice === Infinity ? 0 : minPrice,
          max: maxPrice === -Infinity ? 0 : maxPrice
        }
      }
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/products/{id}/update-price:
 *   post:
 *     summary: Update product price (Testing)
 *     description: Updates or creates a price entry for a product. Used for testing price alerts by simulating price changes.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *               - store
 *             properties:
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 799.99
 *               store:
 *                 type: string
 *                 example: "Amazon"
 *               storeUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://amazon.com/product"
 *               inStock:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Price updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const updateProductPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { price, store, storeUrl, inStock } = req.body;

    // Validation
    if (!price || !store) {
      res.status(400).json({
        success: false,
        message: 'price and store are required'
      });
      return;
    }

    if (typeof price !== 'number' || price <= 0) {
      res.status(400).json({
        success: false,
        message: 'price must be a positive number'
      });
      return;
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Create or update price entry
    const priceEntry = await prisma.price.create({
      data: {
        productId: id,
        price,
        store,
        storeUrl: storeUrl || `https://${store.toLowerCase()}.com/product`,
        inStock: inStock !== undefined ? inStock : true,
        currency: 'USD'
      }
    });

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: { price: priceEntry }
    });
  } catch (error) {
    console.error('Error updating product price:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product price',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
