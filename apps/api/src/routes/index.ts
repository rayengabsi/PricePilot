/**
 * Main Routes
 * Combines all route modules
 */

import { Router } from 'express';
import productRoutes from './productRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import { healthCheck } from '../controllers/healthController';
import { searchProducts, compareProducts } from '../controllers/productController';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// Authentication routes
router.use('/auth', authRoutes);

// User routes (protected)
router.use('/users', userRoutes);

// Product routes
router.use('/products', productRoutes);

// Search endpoint - GET /api/search?q=query
router.get('/search', searchProducts);

// Compare endpoint - POST /api/compare
router.post('/compare', compareProducts);

export default router;
