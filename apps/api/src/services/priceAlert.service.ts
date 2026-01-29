/**
 * Price Alert Service
 * Handles price alert checking and notification logic
 */

import prisma from './database.service';
import { sendPriceAlertEmail, isEmailEnabled } from './email.service';

export interface AlertNotification {
  alertId: string;
  userId: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  targetPrice: number;
  currentPrice: number;
  oldPrice: number;
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
              take: 50
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
      // Get latest price per store (prices are ordered by timestamp desc)
      const latestByStore = new Map<string, (typeof alert.product.prices)[0]>();
      for (const price of alert.product.prices) {
        if (!latestByStore.has(price.store)) {
          latestByStore.set(price.store, price);
        }
      }

      if (latestByStore.size === 0) {
        continue;
      }

      // Find the lowest price across stores (in stock)
      let lowestPrice = Infinity;
      let lowestPriceStore = '';
      let lowestPriceUrl = '';
      for (const price of latestByStore.values()) {
        const priceValue = Number(price.price);
        if (price.inStock && priceValue < lowestPrice) {
          lowestPrice = priceValue;
          lowestPriceStore = price.store;
          lowestPriceUrl = price.storeUrl;
        }
      }
      if (lowestPrice === Infinity) continue;

      // Check if current price is <= target price
      if (lowestPrice <= Number(alert.targetPrice)) {
        // Get previous price at this store for "old vs new" in email
        const previousPrices = await prisma.price.findMany({
          where: {
            productId: alert.productId,
            store: lowestPriceStore
          },
          orderBy: { timestamp: 'desc' },
          take: 2
        });
        const oldPrice =
          previousPrices.length >= 2 ? Number(previousPrices[1].price) : lowestPrice;

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
          productImageUrl: alert.product.imageUrl ?? null,
          targetPrice: Number(alert.targetPrice),
          currentPrice: lowestPrice,
          oldPrice,
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
 * Send notifications for triggered alerts (console + email)
 */
export const sendNotifications = async (notifications: AlertNotification[]): Promise<void> => {
  try {
    for (const notification of notifications) {
      // Get user details including email preference
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailNotifications: true
        }
      });

      if (!user) {
        console.warn(`User ${notification.userId} not found for alert ${notification.alertId}`);
        continue;
      }

      // Log notification
      console.log('🔔 PRICE ALERT TRIGGERED!');
      console.log(`   User: ${user.name || user.email}`);
      console.log(`   Product: ${notification.productName}`);
      console.log(`   Target Price: $${notification.targetPrice}`);
      console.log(`   Current Price: $${notification.currentPrice} at ${notification.store}`);
      console.log(`   Store URL: ${notification.storeUrl}`);
      console.log(`   Triggered At: ${notification.triggeredAt.toISOString()}`);
      console.log('---');

      // Send email if enabled and user has email notifications on
      if (isEmailEnabled() && user.emailNotifications !== false) {
        await sendPriceAlertEmail(
          { id: user.id, email: user.email, name: user.name },
          notification.productName,
          notification.productImageUrl,
          notification.store,
          notification.storeUrl,
          notification.oldPrice,
          notification.currentPrice
        );
      }
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
