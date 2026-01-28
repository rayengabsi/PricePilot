/**
 * Product Routes
 * Defines all product-related API endpoints
 */

import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  updateProductPrice
} from '../controllers/productController';

const router = Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getProductById);

// POST /api/products/:id/update-price - Update product price (for testing)
router.post('/:id/update-price', updateProductPrice);

export default router;
