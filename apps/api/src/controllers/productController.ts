/**
 * Product Controller
 * Handles all product-related endpoints
 */

import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../services/database.service';
import { Product, CompareRequest, CompareResponse, Price } from '../types';
import { searchProducts as searchBestBuy, getApiUsage } from '../services/bestbuy.service';

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
 *     summary: Search products (Best Buy API only, live results)
 *     description: Search for products via Best Buy API. No database; returns fresh API results only.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "iphone"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Max results to return
 *     responses:
 *       200:
 *         description: Search results (sources.database always 0, sources.bestBuy = count)
 *       400:
 *         description: Missing query parameter
 */
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  const { q, limit } = req.query;

  const emptyResponse = (queryStr: string) => {
    res.json({
      success: true,
      query: queryStr,
      count: 0,
      data: [],
      sources: { database: 0, bestBuy: 0 }
    });
  };

  try {
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
      return;
    }

    const limitNum = limit ? Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 24) : 10;
    console.log('[search] GET /api/search – Best Buy only:', { q, limit: limitNum });

    const data = await searchBestBuy(q, limitNum);

    res.json({
      success: true,
      query: q,
      count: data.length,
      data,
      sources: { database: 0, bestBuy: data.length }
    });
  } catch (error) {
    console.error('[search] Best Buy API error (returning empty results):', error);
    emptyResponse(typeof q === 'string' ? q : '');
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
 * /api/bestbuy/search:
 *   get:
 *     summary: Test Best Buy API search
 *     description: Returns raw Best Buy API results for testing purposes. This endpoint directly queries the Best Buy API without database integration.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: iphone
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Successfully retrieved Best Buy API results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 query: { type: 'string', example: 'iphone' }
 *                 count: { type: 'integer', example: 10 }
 *                 apiUsage: 
 *                   type: object
 *                   properties:
 *                     calls: { type: 'integer', example: 5 }
 *                     limit: { type: 'integer', example: 5000 }
 *                     remaining: { type: 'integer', example: 4995 }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - missing query parameter
 *       500:
 *         description: Internal server error or Best Buy API error
 */
export const testBestBuySearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
      return;
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 10;
    const products = await searchBestBuy(q, limitNum);
    const apiUsage = getApiUsage();

    res.json({
      success: true,
      query: q,
      count: products.length,
      apiUsage,
      data: products
    });
  } catch (error) {
    console.error('Error testing Best Buy API:', error);
    res.status(500).json({
      success: false,
      message: 'Error querying Best Buy API',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiUsage: getApiUsage()
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
