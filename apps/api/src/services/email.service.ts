/**
 * Email Service for PricePilot
 * Uses Nodemailer with Ethereal.email for development (free fake SMTP)
 * View sent emails at https://ethereal.email
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { getPriceAlertHtml, getWelcomeHtml, getTestEmailHtml } from './email.templates';
import type { PriceAlertTemplateData, WelcomeTemplateData } from './email.templates';

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pricepilot.com';

let transporter: Transporter | null = null;
let etherealTestAccount: nodemailer.TestAccount | null = null;
let hasLoggedOnFirstSend = false;

function logEtherealCredentials(account: nodemailer.TestAccount): void {
  console.log('');
  console.log('======= ETHERAL EMAIL CREDENTIALS =======');
  console.log('📧 Email:', account.user);
  console.log('🔑 Password:', account.pass);
  console.log('🌐 Login: https://ethereal.email');
  console.log('=========================================');
  console.log('');
}

export interface EmailUser {
  id: string;
  email: string;
  name: string | null;
}

export interface PriceAlertEmailData {
  user: EmailUser;
  productName: string;
  productImageUrl: string | null;
  store: string;
  storeUrl: string;
  oldPrice: number;
  newPrice: number;
}

/**
 * Get or create Ethereal transporter for development
 * Creates a test account automatically - no configuration needed
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) {
    return transporter;
  }

  // Development: use Ethereal (automatic test account)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    const account = await nodemailer.createTestAccount();
    etherealTestAccount = account;
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    logEtherealCredentials(account);
    return transporter;
  }

  // Production: use configured SMTP
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

/**
 * Initialize email service on server startup.
 * Creates Ethereal test account and logs credentials so they appear every time the server starts.
 */
export async function initializeEmailService(): Promise<void> {
  if (!EMAIL_ENABLED) return;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) return; // Using real SMTP
  if (transporter && etherealTestAccount) {
    logEtherealCredentials(etherealTestAccount);
    return;
  }
  await getTransporter();
}

/**
 * Check if email is enabled and send if so
 */
function isEmailEnabled(): boolean {
  return EMAIL_ENABLED;
}

function logEtherealOnFirstSend(): void {
  if (etherealTestAccount && !hasLoggedOnFirstSend) {
    hasLoggedOnFirstSend = true;
    console.log('');
    console.log('📧 First email sent. Ethereal credentials (for reference):');
    logEtherealCredentials(etherealTestAccount);
  }
}

/**
 * Send price alert email when a user's alert is triggered
 */
export async function sendPriceAlertEmail(
  user: EmailUser,
  productName: string,
  productImageUrl: string | null,
  store: string,
  storeUrl: string,
  oldPrice: number,
  newPrice: number
): Promise<{ sent: boolean; messageId?: string; previewUrl?: string }> {
  if (!isEmailEnabled()) {
    return { sent: false };
  }

  try {
    const savings = oldPrice - newPrice;
    const savingsPercent = oldPrice > 0 ? (savings / oldPrice) * 100 : 0;

    const templateData: PriceAlertTemplateData = {
      userName: user.name || 'there',
      productName,
      productImageUrl: productImageUrl || '',
      store,
      storeUrl,
      oldPrice,
      newPrice,
      savings,
      savingsPercent
    };

    const html = getPriceAlertHtml(templateData);
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: `🎯 Price Alert: ${productName} is now $${newPrice.toFixed(2)} at ${store}`,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Price alert email sent. Preview:', previewUrl);
    }
    logEtherealOnFirstSend();

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined
    };
  } catch (error) {
    console.error('Error sending price alert email:', error);
    return { sent: false };
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(user: EmailUser): Promise<{ sent: boolean; messageId?: string; previewUrl?: string }> {
  if (!isEmailEnabled()) {
    return { sent: false };
  }

  try {
    const templateData: WelcomeTemplateData = {
      userName: user.name || 'there',
      userEmail: user.email
    };

    const html = getWelcomeHtml(templateData);
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to PricePilot 🎯',
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Welcome email sent. Preview:', previewUrl);
    }
    logEtherealOnFirstSend();

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { sent: false };
  }
}

/**
 * Send test email to a given address
 */
export async function sendTestEmail(to: string): Promise<{ sent: boolean; messageId?: string; previewUrl?: string }> {
  if (!isEmailEnabled()) {
    return { sent: false };
  }

  try {
    const html = getTestEmailHtml(to);
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject: 'PricePilot - Test Email ✅',
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    logEtherealOnFirstSend();

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { sent: false };
  }
}

/**
 * Get HTML previews of email templates (for GET /api/email/templates)
 */
export function getTemplatePreviews(): {
  priceAlert: string;
  welcome: string;
  test: string;
} {
  const priceAlertData: PriceAlertTemplateData = {
    userName: 'Alex',
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    productImageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6505/6505140_sd.jpg',
    store: 'Best Buy',
    storeUrl: 'https://www.bestbuy.com/sample',
    oldPrice: 399.99,
    newPrice: 299.99,
    savings: 100,
    savingsPercent: 25
  };

  const welcomeData: WelcomeTemplateData = {
    userName: 'Alex',
    userEmail: 'alex@example.com'
  };

  return {
    priceAlert: getPriceAlertHtml(priceAlertData),
    welcome: getWelcomeHtml(welcomeData),
    test: getTestEmailHtml('test@example.com')
  };
}

export { isEmailEnabled };
