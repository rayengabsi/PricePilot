/**
 * Health Check Controller
 * Handles health check endpoints
 */

import { Request, Response } from 'express';
import prisma from '../services/database.service';
import { getSchedulerStatus } from '../services/scheduler.service';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API service and database connection
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
 *               database: connected
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       503:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 service:
 *                   type: string
 *                   example: PricePilot API
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get scheduler status
    const schedulerStatus = getSchedulerStatus();

    res.json({
      status: 'healthy',
      service: 'PricePilot API',
      database: 'connected',
      scheduler: {
        enabled: schedulerStatus.isEnabled,
        running: schedulerStatus.isRunning,
        checkInProgress: schedulerStatus.checkInProgress,
        interval: schedulerStatus.interval
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'PricePilot API',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
