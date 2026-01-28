/**
 * Price Alert Service
 * Handles price alert checking and notification logic
 */

import prisma from './database.service';

export interface AlertNotification {
  alertId: string;
  userId: string;
  productId: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  store: string;
  storeUrl: string;
  triggeredAt: Date;
}

/**
 * Check all active price alerts against current prices
 * Returns array of triggered alerts
 */
export const checkPriceAlerts = async (): Promise<AlertNotification[]> => {
  try {
    // Get all active alerts
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        status: 'active'
      },
      include: {
        product: {
          include: {
            prices: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 1 // Get only the latest price per store
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    const triggeredAlerts: AlertNotification[] = [];

    for (const alert of activeAlerts) {
      // Get the lowest current price across all stores
      if (alert.product.prices.length === 0) {
        continue; // No prices available
      }

      // Find the lowest price
      let lowestPrice = Number(alert.product.prices[0].price);
      let lowestPriceStore = alert.product.prices[0].store;
      let lowestPriceUrl = alert.product.prices[0].storeUrl;

      for (const price of alert.product.prices) {
        const priceValue = Number(price.price);
        if (priceValue < lowestPrice && price.inStock) {
          lowestPrice = priceValue;
          lowestPriceStore = price.store;
          lowestPriceUrl = price.storeUrl;
        }
      }

      // Check if current price is <= target price
      if (lowestPrice <= Number(alert.targetPrice)) {
        // Mark alert as triggered
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            status: 'triggered',
            isActive: false,
            triggeredAt: new Date()
          }
        });

        triggeredAlerts.push({
          alertId: alert.id,
          userId: alert.userId,
          productId: alert.productId,
          productName: alert.product.name,
          targetPrice: Number(alert.targetPrice),
          currentPrice: lowestPrice,
          store: lowestPriceStore,
          storeUrl: lowestPriceUrl,
          triggeredAt: new Date()
        });
      }
    }

    return triggeredAlerts;
  } catch (error) {
    console.error('Error checking price alerts:', error);
    throw error;
  }
};

/**
 * Send notifications for triggered alerts
 * Currently logs to console, can be extended for email/push notifications
 */
export const sendNotifications = async (notifications: AlertNotification[]): Promise<void> => {
  try {
    for (const notification of notifications) {
      // Get user details for notification
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: {
          email: true,
          name: true
        }
      });

      if (!user) {
        console.warn(`User ${notification.userId} not found for alert ${notification.alertId}`);
        continue;
      }

      // Log notification (replace with email/push notification service later)
      console.log('🔔 PRICE ALERT TRIGGERED!');
      console.log(`   User: ${user.name || user.email}`);
      console.log(`   Product: ${notification.productName}`);
      console.log(`   Target Price: $${notification.targetPrice}`);
      console.log(`   Current Price: $${notification.currentPrice} at ${notification.store}`);
      console.log(`   Store URL: ${notification.storeUrl}`);
      console.log(`   Triggered At: ${notification.triggeredAt.toISOString()}`);
      console.log('---');

      // TODO: Send email notification
      // await emailService.sendPriceAlert(user.email, notification);

      // TODO: Send push notification
      // await pushService.sendPriceAlert(user.id, notification);
    }

    console.log(`✅ Processed ${notifications.length} price alert notification(s)`);
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

/**
 * Process all price alerts (check and notify)
 * This is the main function to call periodically (e.g., via cron job)
 */
export const processPriceAlerts = async (): Promise<number> => {
  try {
    const triggeredAlerts = await checkPriceAlerts();
    
    if (triggeredAlerts.length > 0) {
      await sendNotifications(triggeredAlerts);
    }

    return triggeredAlerts.length;
  } catch (error) {
    console.error('Error processing price alerts:', error);
    throw error;
  }
};
