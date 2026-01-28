/**
 * Price Alert Routes
 * Defines all price alert-related API endpoints
 */

import { Router } from 'express';
import {
  createAlert,
  getAlerts,
  deleteAlert,
  checkAlerts
} from '../controllers/priceAlertController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/alerts - Create price alert
router.post('/', createAlert);

// GET /api/alerts - Get user's alerts
router.get('/', getAlerts);

// GET /api/alerts/check - Check all alerts
router.get('/check', checkAlerts);

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', deleteAlert);

export default router;
