/**
 * Product Controller
 * Handles all product-related endpoints
 */

import { Request, Response } from 'express';
import { mockProducts } from '../utils/mockData';
import { Product, CompareRequest, CompareResponse } from '../types';

/**
 * Get all products
 */
export const getAllProducts = (req: Request, res: Response): void => {
  try {
    res.json({
      success: true,
      count: mockProducts.length,
      data: mockProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`
      });
      return;
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Search products by query string
 */
export const searchProducts = (req: Request, res: Response): void => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required'
      });
      return;
    }

    // Filter products by search query
    let results = mockProducts.filter(product => {
      const searchTerm = q.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(searchTerm);
      const matchesDescription = product.description.toLowerCase().includes(searchTerm);
      const matchesBrand = product.brand.toLowerCase().includes(searchTerm);
      
      return matchesName || matchesDescription || matchesBrand;
    });

    // Filter by category if provided
    if (category && typeof category === 'string') {
      results = results.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by price range if provided
    if (minPrice || maxPrice) {
      results = results.filter(product => {
        const prices = product.prices.map(p => p.price);
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

    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Compare multiple products
 */
export const compareProducts = (req: Request, res: Response): void => {
  try {
    const { productIds }: CompareRequest = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'productIds array is required and must not be empty'
      });
      return;
    }

    // Find all requested products
    const products = productIds
      .map(id => mockProducts.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);

    if (products.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No valid products found for comparison'
      });
      return;
    }

    // Find the cheapest price across all products
    let cheapest = {
      productId: products[0].id,
      store: products[0].prices[0].store,
      price: products[0].prices[0].price
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
          min: minPrice,
          max: maxPrice
        }
      }
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
