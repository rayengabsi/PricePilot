/**
 * Price Alert Controller
 * Handles price alert CRUD operations
 */

import { Response } from 'express';
import prisma from '../services/database.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { processPriceAlerts } from '../services/priceAlert.service';

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new price alert
 *     description: Creates a price alert for the authenticated user. User will be notified when the product price drops to or below the target price.
 *     tags: [Price Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - targetPrice
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to monitor
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               targetPrice:
 *                 type: number
 *                 format: float
 *                 description: Target price threshold (alert triggers when price <= targetPrice)
 *                 example: 800.00
 *     responses:
 *       201:
 *         description: Price alert created successfully
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { productId, targetPrice } = req.body;

    // Validation
    if (!productId || targetPrice === undefined) {
      res.status(400).json({
        success: false,
        message: 'productId and targetPrice are required'
      });
      return;
    }

    if (typeof targetPrice !== 'number' || targetPrice <= 0) {
      res.status(400).json({
        success: false,
        message: 'targetPrice must be a positive number'
      });
      return;
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Check if user already has an active alert for this product
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId: req.user.id,
        productId,
        isActive: true,
        status: 'active'
      }
    });

    if (existingAlert) {
      res.status(409).json({
        success: false,
        message: 'You already have an active alert for this product. Update or delete the existing alert first.'
      });
      return;
    }

    // Create alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: req.user.id,
        productId,
        targetPrice,
        isActive: true,
        status: 'active'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Price alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating price alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get user's price alerts
 *     description: Retrieves all price alerts for the authenticated user
 *     tags: [Price Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, triggered, cancelled]
 *         description: Filter alerts by status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Successfully retrieved alerts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { status, isActive } = req.query;

    // Build where clause
    const where: any = {
      userId: req.user.id
    };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const alerts = await prisma.priceAlert.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            imageUrl: true,
            prices: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete a price alert
 *     description: Deletes (cancels) a price alert by ID. Only the owner can delete their alerts.
 *     tags: [Price Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 *       403:
 *         description: Forbidden - not the owner
 *       500:
 *         description: Internal server error
 */
export const deleteAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const { id } = req.params;

    // Find alert and verify ownership
    const alert = await prisma.priceAlert.findUnique({
      where: { id }
    });

    if (!alert) {
      res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
      return;
    }

    if (alert.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden - you can only delete your own alerts'
      });
      return;
    }

    // Update alert status to cancelled instead of deleting (for history)
    await prisma.priceAlert.update({
      where: { id },
      data: {
        isActive: false,
        status: 'cancelled'
      }
    });

    res.json({
      success: true,
      message: 'Alert cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @swagger
 * /api/alerts/check:
 *   get:
 *     summary: Check all price alerts
 *     description: Manually trigger price alert checking. Checks all active alerts against current prices and sends notifications for triggered alerts.
 *     tags: [Price Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Price alerts checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     triggeredCount:
 *                       type: integer
 *                       description: Number of alerts triggered
 *       500:
 *         description: Internal server error
 */
export const checkAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Process all price alerts
    const triggeredCount = await processPriceAlerts();

    res.json({
      success: true,
      message: `Price alerts checked. ${triggeredCount} alert(s) triggered.`,
      data: {
        triggeredCount
      }
    });
  } catch (error) {
    console.error('Error checking alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
