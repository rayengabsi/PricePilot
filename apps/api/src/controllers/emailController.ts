/**
 * Email Controller
 * Test and preview email functionality
 */

import { Request, Response } from 'express';
import { sendTestEmail, getTemplatePreviews, isEmailEnabled } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Send test email
 *     description: Sends a test email to the authenticated user or to the address in body. Requires EMAIL_ENABLED=true.
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Optional recipient (defaults to authenticated user email)
 *     responses:
 *       200:
 *         description: Test email sent (previewUrl for Ethereal in dev)
 *       400:
 *         description: No recipient
 *       503:
 *         description: Email disabled
 */
export const sendTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!isEmailEnabled()) {
      res.status(503).json({
        success: false,
        message: 'Email is disabled. Set EMAIL_ENABLED=true in .env'
      });
      return;
    }

    const to = (req.body?.to as string) || req.user?.email;
    if (!to) {
      res.status(400).json({
        success: false,
        message: 'No recipient. Provide "to" in body or use authenticated user email.'
      });
      return;
    }

    const result = await sendTestEmail(to);
    if (!result.sent) {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        to,
        messageId: result.messageId,
        previewUrl: result.previewUrl
      }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/email/templates:
 *   get:
 *     summary: Preview email templates
 *     description: Returns HTML previews. Use ?template=priceAlert|welcome|test for single HTML, or omit for all as JSON.
 *     tags: [Email]
 *     parameters:
 *       - in: query
 *         name: template
 *         schema:
 *           type: string
 *           enum: [priceAlert, welcome, test]
 *         description: Optional - return single template as HTML
 *     responses:
 *       200:
 *         description: Template(s) HTML or JSON
 */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const previews = getTemplatePreviews();
    const template = (req.query.template as string) || 'all';

    if (template === 'priceAlert') {
      res.type('html').send(previews.priceAlert);
      return;
    }
    if (template === 'welcome') {
      res.type('html').send(previews.welcome);
      return;
    }
    if (template === 'test') {
      res.type('html').send(previews.test);
      return;
    }

    // Return all as JSON with HTML strings for programmatic use
    res.json({
      success: true,
      data: {
        priceAlert: previews.priceAlert,
        welcome: previews.welcome,
        test: previews.test
      }
    });
  } catch (error) {
    console.error('Error getting email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting email templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
