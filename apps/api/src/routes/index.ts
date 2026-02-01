/**
 * Main Routes
 * Combines all route modules
 */

import { Router } from 'express';
import productRoutes from './productRoutes';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import priceAlertRoutes from './priceAlertRoutes';
import emailRoutes from './emailRoutes';
import { healthCheck, healthCheckBestBuy } from '../controllers/healthController';
import { searchProducts, compareProducts, testBestBuySearch } from '../controllers/productController';

const router = Router();

// Health check endpoints
router.get('/health', healthCheck);
router.get('/health/bestbuy', healthCheckBestBuy);

// Authentication routes
router.use('/auth', authRoutes);

// User routes (protected)
router.use('/users', userRoutes);

// Product routes
router.use('/products', productRoutes);

// Price alert routes (protected)
router.use('/alerts', priceAlertRoutes);

// Email test & template preview
router.use('/email', emailRoutes);

// Search endpoint - PUBLIC (no auth), GET /api/search?q=query
router.get('/search', searchProducts);

// Compare endpoint - POST /api/compare
router.post('/compare', compareProducts);

// Best Buy API test endpoint - GET /api/bestbuy/search?q=query
router.get('/bestbuy/search', testBestBuySearch);

export default router;
