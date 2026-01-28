/**
 * Scheduler Service
 * Handles automatic scheduled tasks for price alert checking
 */

import * as cron from 'node-cron';
import { processPriceAlerts } from './priceAlert.service';
import { updateBestBuyPrices } from './bestbuy.service';

let priceCheckJob: ReturnType<typeof cron.schedule> | null = null;
let isRunning = false;

/**
 * Get the check interval from environment variable
 * Default: 1 hour (cron format: '0 * * * *' = every hour at minute 0)
 */
const getCheckInterval = (): string => {
  const interval = process.env.PRICE_CHECK_INTERVAL || '0 * * * *'; // Every hour
  
  // Support both cron format and simple interval strings
  if (interval.includes('*') || interval.includes('/')) {
    return interval; // Already in cron format
  }
  
  // Convert simple format like "1h", "30m" to cron
  const hours = parseInt(interval.replace('h', '')) || 1;
  return `0 */${hours} * * *`; // Every N hours
};

/**
 * Check if price checking is enabled
 */
const isPriceCheckEnabled = (): boolean => {
  return process.env.ENABLE_PRICE_CHECK !== 'false';
};

/**
 * Run a single price check cycle
 * Returns the number of triggered alerts
 */
const runPriceCheck = async (): Promise<number> => {
  if (isRunning) {
    console.log('⏸️  Price check already running, skipping this cycle');
    return 0;
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log('🔄 Starting scheduled price check...');
    
    // Update Best Buy prices first (daily updates)
    try {
      const now = new Date();
      const hours = now.getUTCHours();
      
      // Run Best Buy price updates once per day at 2 AM UTC
      if (hours === 2) {
        console.log('🔄 Updating Best Buy product prices...');
        const bbUpdateResult = await updateBestBuyPrices();
        console.log(`✅ Best Buy prices updated: ${bbUpdateResult.updated} products, ${bbUpdateResult.errors} errors`);
      }
    } catch (bbError) {
      console.error('⚠️  Error updating Best Buy prices (continuing with alert check):', bbError);
      // Don't fail the entire check if Best Buy update fails
    }
    
    // Check price alerts
    const triggeredCount = await processPriceAlerts();
    
    const duration = Date.now() - startTime;
    
    if (triggeredCount > 0) {
      console.log(`✅ Price check completed in ${duration}ms - ${triggeredCount} alert(s) triggered`);
    } else {
      console.log(`✅ Price check completed in ${duration}ms - No alerts triggered`);
    }
    
    return triggeredCount;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Price check failed after ${duration}ms:`, error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    isRunning = false;
  }
};

/**
 * Start the scheduled price checking
 */
export const startPriceCheckScheduler = (): void => {
  if (!isPriceCheckEnabled()) {
    console.log('⏭️  Price check scheduler is disabled (ENABLE_PRICE_CHECK=false)');
    return;
  }

  if (priceCheckJob) {
    console.log('⚠️  Price check scheduler is already running');
    return;
  }

  const cronExpression = getCheckInterval();
  console.log(`⏰ Starting price check scheduler with interval: ${cronExpression}`);

  // Schedule the job
  priceCheckJob = cron.schedule(cronExpression, async () => {
    try {
      await runPriceCheck();
    } catch (error) {
      // Error is already logged in runPriceCheck
      // Don't let it crash the scheduler
    }
  });

  // Run initial check after 30 seconds (to allow server to fully start)
  setTimeout(async () => {
    console.log('🚀 Running initial price check in 30 seconds...');
    setTimeout(async () => {
      await runPriceCheck();
    }, 30000);
  }, 0);
  
  // Log scheduler info
  console.log(`📅 Next price check will run according to schedule: ${cronExpression}`);

  console.log('✅ Price check scheduler started successfully');
};

/**
 * Stop the scheduled price checking
 */
export const stopPriceCheckScheduler = (): void => {
  if (priceCheckJob) {
    priceCheckJob.stop();
    priceCheckJob = null;
    console.log('🛑 Price check scheduler stopped');
  } else {
    console.log('⚠️  Price check scheduler is not running');
  }
};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = (): {
  isRunning: boolean;
  isEnabled: boolean;
  interval: string;
  checkInProgress: boolean;
} => {
  return {
    isRunning: priceCheckJob !== null,
    isEnabled: isPriceCheckEnabled(),
    interval: getCheckInterval(),
    checkInProgress: isRunning
  };
};

/**
 * Manually trigger a price check (for testing)
 */
export const triggerManualCheck = async (): Promise<number> => {
  if (isRunning) {
    throw new Error('Price check is already running');
  }

  return await runPriceCheck();
};
