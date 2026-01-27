/**
 * Health Check Controller
 * Handles health check endpoints
 */

import { Request, Response } from 'express';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: healthy
 *               service: PricePilot API
 *               timestamp: "2024-01-15T10:30:00.000Z"
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'PricePilot API',
    timestamp: new Date().toISOString()
  });
};
