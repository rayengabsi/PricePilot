/**
 * Product Routes
 * Defines all product-related API endpoints
 */

import { Router } from 'express';
import {
  getAllProducts,
  getProductById
} from '../controllers/productController';

const router = Router();

// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getProductById);

export default router;
