/**
 * HTML Email Templates for PricePilot
 * Responsive, professional design with inline CSS for email clients
 */

export interface PriceAlertTemplateData {
  userName: string;
  productName: string;
  productImageUrl: string;
  store: string;
  storeUrl: string;
  oldPrice: number;
  newPrice: number;
  savings: number;
  savingsPercent: number;
}

export interface WelcomeTemplateData {
  userName: string;
  userEmail: string;
}

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2d3748;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  background: #ffffff;
`;

/**
 * Price Alert Email Template
 * Shows product image, price comparison, and CTA to buy
 */
export const getPriceAlertHtml = (data: PriceAlertTemplateData): string => {
  const { userName, productName, productImageUrl, store, storeUrl, oldPrice, newPrice, savings, savingsPercent } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Alert - ${productName}</title>
</head>
<body style="${baseStyles} background: #f7fafc;">
  <div style="${containerStyles}">
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; border-radius: 0 0 16px 16px;">
      <tr>
        <td>
          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
            🎯 PricePilot
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            Your price alert has been triggered!
          </p>
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <div style="padding: 28px 0 16px 0;">
      <p style="margin: 0; font-size: 16px;">
        Hi ${userName || 'there'},
      </p>
      <p style="margin: 12px 0 0 0; font-size: 16px; color: #4a5568;">
        Great news! The price dropped on an item you're watching.
      </p>
    </div>

    <!-- Product Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="120" style="vertical-align: top;">
                ${productImageUrl ? `<img src="${productImageUrl}" alt="${productName}" style="width: 120px; height: 120px; object-fit: contain; border-radius: 8px; background: #f7fafc;" />` : '<div style="width: 120px; height: 120px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 12px;">No image</div>'}
              </td>
              <td style="padding-left: 20px; vertical-align: top;">
                <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a202c; line-height: 1.4;">
                  ${productName}
                </h2>
                <p style="margin: 0; font-size: 14px; color: #718096;">
                  Available at <strong>${store}</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Price Comparison -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; background: #f0fff4; border-radius: 8px; border: 1px solid #9ae6b4;">
            <tr>
              <td style="padding: 16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 50%;">
                      <p style="margin: 0; font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">Was</p>
                      <p style="margin: 4px 0 0 0; font-size: 20px; color: #718096; text-decoration: line-through;">$${oldPrice.toFixed(2)}</p>
                    </td>
                    <td style="width: 50%; text-align: right;">
                      <p style="margin: 0; font-size: 12px; color: #276749; text-transform: uppercase; letter-spacing: 0.5px;">Now</p>
                      <p style="margin: 4px 0 0 0; font-size: 28px; font-weight: 700; color: #276749;">$${newPrice.toFixed(2)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 12px; border-top: 1px solid #9ae6b4;">
                      <p style="margin: 0; font-size: 14px; color: #276749;">
                        <strong>You save $${savings.toFixed(2)} (${savingsPercent.toFixed(0)}%)</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
            <tr>
              <td>
                <a href="${storeUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View at ${store} →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="padding: 24px 0; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #a0aec0;">
        You received this email because you set up a price alert on PricePilot.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #a0aec0;">
        © ${new Date().getFullYear()} PricePilot. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`.trim();
};

/**
 * Welcome Email Template
 */
export const getWelcomeHtml = (data: WelcomeTemplateData): string => {
  const { userName, userEmail } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PricePilot</title>
</head>
<body style="${baseStyles} background: #f7fafc;">
  <div style="${containerStyles}">
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 24px; border-radius: 0 0 16px 16px;">
      <tr>
        <td style="text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
            🎯 Welcome to PricePilot
          </h1>
          <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
            Never overpay again
          </p>
        </td>
      </tr>
    </table>

    <!-- Content -->
    <div style="padding: 32px 0;">
      <p style="margin: 0; font-size: 18px;">
        Hi ${userName || 'there'},
      </p>
      <p style="margin: 16px 0 0 0; font-size: 16px; color: #4a5568;">
        Thanks for signing up! Your account <strong>${userEmail}</strong> is ready.
      </p>
      <p style="margin: 16px 0 0 0; font-size: 16px; color: #4a5568;">
        With PricePilot you can:
      </p>
      <ul style="margin: 16px 0 0 0; padding-left: 24px; color: #4a5568; font-size: 16px;">
        <li style="margin-bottom: 8px;">Search products and compare prices across stores</li>
        <li style="margin-bottom: 8px;">Set price alerts and get notified when prices drop</li>
        <li style="margin-bottom: 8px;">Track your favorite items and save money</li>
      </ul>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
        <tr>
          <td>
            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Create your first price alert
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding: 24px 0; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #a0aec0;">
        © ${new Date().getFullYear()} PricePilot. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`.trim();
};

/**
 * Simple test email template
 */
export const getTestEmailHtml = (to: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PricePilot - Test Email</title>
</head>
<body style="${baseStyles} background: #f7fafc;">
  <div style="${containerStyles}">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin-top: 24px;">
      <tr>
        <td>
          <h2 style="margin: 0; color: #ffffff;">✅ Test Email</h2>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9);">
            This is a test email from PricePilot sent to ${to}.
          </p>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
            If you received this, your email configuration is working!
          </p>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0 0; font-size: 14px; color: #718096;">
      Sent at ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`.trim();
};
