/**
 * User Routes
 * Defines all user-related API endpoints
 */

import { Router } from 'express';
import { getProfile } from '../controllers/userController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/users/profile - Get current user profile (protected)
router.get('/profile', authenticate, getProfile);

export default router;
