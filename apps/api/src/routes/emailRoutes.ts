/**
 * Email Routes
 * Test and preview email endpoints
 */

import { Router } from 'express';
import { sendTest, getTemplates } from '../controllers/emailController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/email/test - Send test email (authenticated user or body.to)
router.post('/test', authenticate, sendTest);

// GET /api/email/templates - Preview templates (?template=priceAlert|welcome|test for HTML, or all as JSON)
router.get('/templates', getTemplates);

export default router;
