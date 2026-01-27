/**
 * Health Check Controller
 * Handles health check endpoints
 */

import { Request, Response } from 'express';

/**
 * Health check endpoint
 */
export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'PricePilot API',
    timestamp: new Date().toISOString()
  });
};
