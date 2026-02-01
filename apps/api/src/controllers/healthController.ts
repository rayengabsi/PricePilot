/**
 * Health Check Controller
 * Handles health check endpoints
 */

import { Request, Response } from 'express';
import prisma from '../services/database.service';
import { getSchedulerStatus } from '../services/scheduler.service';
import { checkBestBuyConnectivity } from '../services/bestbuy.service';

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

/**
 * Best Buy API health check – GET /api/health/bestbuy
 */
export const healthCheckBestBuy = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await checkBestBuyConnectivity();
    if (result.ok) {
      res.json({
        status: 'healthy',
        service: 'Best Buy API',
        bestbuy: 'connected',
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'Best Buy API',
        bestbuy: 'disconnected',
        message: result.message,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Best Buy health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'Best Buy API',
      bestbuy: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
