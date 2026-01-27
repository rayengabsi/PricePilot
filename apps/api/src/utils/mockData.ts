/**
 * Mock data for PricePilot API
 * Contains realistic product data with prices from multiple stores
 */

import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '6.1-inch Super Retina XDR display with ProMotion. A17 Pro chip. Titanium design. Pro camera system with 3x Telephoto.',
    category: 'Smartphones',
    brand: 'Apple',
    imageUrl: 'https://example.com/iphone15pro.jpg',
    specifications: {
      'Storage': '256GB',
      'Color': 'Natural Titanium',
      'Display': '6.1-inch Super Retina XDR',
      'Chip': 'A17 Pro',
      'Camera': '48MP Main, 12MP Ultra Wide, 12MP Telephoto'
    },
    prices: [
      {
        store: 'Amazon',
        price: 999.00,
        currency: 'USD',
        url: 'https://amazon.com/iphone15pro',
        inStock: true,
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        store: 'Best Buy',
        price: 999.00,
        currency: 'USD',
        url: 'https://bestbuy.com/iphone15pro',
        inStock: true,
        lastUpdated: '2024-01-15T09:15:00Z'
      },
      {
        store: 'Walmart',
        price: 979.00,
        currency: 'USD',
        url: 'https://walmart.com/iphone15pro',
        inStock: true,
        lastUpdated: '2024-01-15T11:00:00Z'
      },
      {
        store: 'Target',
        price: 999.00,
        currency: 'USD',
        url: 'https://target.com/iphone15pro',
        inStock: false,
        lastUpdated: '2024-01-14T16:20:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    description: '6.8-inch Dynamic AMOLED 2X display. Snapdragon 8 Gen 3. 200MP camera with 100x Space Zoom. S Pen included.',
    category: 'Smartphones',
    brand: 'Samsung',
    imageUrl: 'https://example.com/galaxys24ultra.jpg',
    specifications: {
      'Storage': '512GB',
      'Color': 'Titanium Black',
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Chip': 'Snapdragon 8 Gen 3',
      'Camera': '200MP Main, 12MP Ultra Wide, 50MP Telephoto, 10MP Telephoto'
    },
    prices: [
      {
        store: 'Amazon',
        price: 1199.99,
        currency: 'USD',
        url: 'https://amazon.com/galaxys24ultra',
        inStock: true,
        lastUpdated: '2024-01-15T10:45:00Z'
      },
      {
        store: 'Best Buy',
        price: 1199.99,
        currency: 'USD',
        url: 'https://bestbuy.com/galaxys24ultra',
        inStock: true,
        lastUpdated: '2024-01-15T09:30:00Z'
      },
      {
        store: 'Walmart',
        price: 1179.99,
        currency: 'USD',
        url: 'https://walmart.com/galaxys24ultra',
        inStock: true,
        lastUpdated: '2024-01-15T11:15:00Z'
      },
      {
        store: 'Samsung Store',
        price: 1199.99,
        currency: 'USD',
        url: 'https://samsung.com/galaxys24ultra',
        inStock: true,
        lastUpdated: '2024-01-15T08:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'MacBook Pro 16-inch',
    description: '16.2-inch Liquid Retina XDR display. M3 Pro chip. 18-hour battery life. Professional performance for creators.',
    category: 'Laptops',
    brand: 'Apple',
    imageUrl: 'https://example.com/macbookpro16.jpg',
    specifications: {
      'Processor': 'M3 Pro',
      'Memory': '18GB Unified Memory',
      'Storage': '512GB SSD',
      'Display': '16.2-inch Liquid Retina XDR',
      'Battery': 'Up to 18 hours'
    },
    prices: [
      {
        store: 'Amazon',
        price: 2499.00,
        currency: 'USD',
        url: 'https://amazon.com/macbookpro16',
        inStock: true,
        lastUpdated: '2024-01-15T10:20:00Z'
      },
      {
        store: 'Best Buy',
        price: 2499.00,
        currency: 'USD',
        url: 'https://bestbuy.com/macbookpro16',
        inStock: true,
        lastUpdated: '2024-01-15T09:45:00Z'
      },
      {
        store: 'Apple Store',
        price: 2499.00,
        currency: 'USD',
        url: 'https://apple.com/macbookpro16',
        inStock: true,
        lastUpdated: '2024-01-15T08:30:00Z'
      },
      {
        store: 'B&H Photo',
        price: 2449.00,
        currency: 'USD',
        url: 'https://bhphotovideo.com/macbookpro16',
        inStock: true,
        lastUpdated: '2024-01-15T11:30:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'Dell XPS 15',
    description: '15.6-inch OLED display. Intel Core i7-13700H. NVIDIA RTX 4050. Premium design for professionals.',
    category: 'Laptops',
    brand: 'Dell',
    imageUrl: 'https://example.com/dellxps15.jpg',
    specifications: {
      'Processor': 'Intel Core i7-13700H',
      'Graphics': 'NVIDIA RTX 4050',
      'Memory': '16GB DDR5',
      'Storage': '512GB NVMe SSD',
      'Display': '15.6-inch OLED 3.5K'
    },
    prices: [
      {
        store: 'Amazon',
        price: 1799.99,
        currency: 'USD',
        url: 'https://amazon.com/dellxps15',
        inStock: true,
        lastUpdated: '2024-01-15T10:10:00Z'
      },
      {
        store: 'Best Buy',
        price: 1799.99,
        currency: 'USD',
        url: 'https://bestbuy.com/dellxps15',
        inStock: true,
        lastUpdated: '2024-01-15T09:20:00Z'
      },
      {
        store: 'Dell Store',
        price: 1799.99,
        currency: 'USD',
        url: 'https://dell.com/xps15',
        inStock: true,
        lastUpdated: '2024-01-15T08:15:00Z'
      },
      {
        store: 'Newegg',
        price: 1749.99,
        currency: 'USD',
        url: 'https://newegg.com/dellxps15',
        inStock: true,
        lastUpdated: '2024-01-15T11:45:00Z'
      }
    ]
  },
  {
    id: '5',
    name: 'PlayStation 5',
    description: 'Next-generation gaming console with 4K gaming, ray tracing, and ultra-fast SSD. Includes DualSense wireless controller.',
    category: 'Gaming Consoles',
    brand: 'Sony',
    imageUrl: 'https://example.com/ps5.jpg',
    specifications: {
      'CPU': 'AMD Zen 2',
      'GPU': 'AMD RDNA 2',
      'Memory': '16GB GDDR6',
      'Storage': '825GB SSD',
      'Resolution': 'Up to 4K 120fps'
    },
    prices: [
      {
        store: 'Amazon',
        price: 499.99,
        currency: 'USD',
        url: 'https://amazon.com/ps5',
        inStock: true,
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      {
        store: 'Best Buy',
        price: 499.99,
        currency: 'USD',
        url: 'https://bestbuy.com/ps5',
        inStock: true,
        lastUpdated: '2024-01-15T09:00:00Z'
      },
      {
        store: 'Walmart',
        price: 499.99,
        currency: 'USD',
        url: 'https://walmart.com/ps5',
        inStock: true,
        lastUpdated: '2024-01-15T11:20:00Z'
      },
      {
        store: 'Target',
        price: 499.99,
        currency: 'USD',
        url: 'https://target.com/ps5',
        inStock: false,
        lastUpdated: '2024-01-14T15:30:00Z'
      },
      {
        store: 'GameStop',
        price: 499.99,
        currency: 'USD',
        url: 'https://gamestop.com/ps5',
        inStock: true,
        lastUpdated: '2024-01-15T10:30:00Z'
      }
    ]
  },
  {
    id: '6',
    name: 'Xbox Series X',
    description: 'Most powerful Xbox ever. 4K gaming at 60fps, up to 120fps. 1TB custom SSD. Includes Xbox Wireless Controller.',
    category: 'Gaming Consoles',
    brand: 'Microsoft',
    imageUrl: 'https://example.com/xboxseriesx.jpg',
    specifications: {
      'CPU': 'Custom AMD Zen 2',
      'GPU': 'Custom AMD RDNA 2',
      'Memory': '16GB GDDR6',
      'Storage': '1TB Custom SSD',
      'Resolution': 'Up to 4K 120fps'
    },
    prices: [
      {
        store: 'Amazon',
        price: 499.99,
        currency: 'USD',
        url: 'https://amazon.com/xboxseriesx',
        inStock: true,
        lastUpdated: '2024-01-15T10:15:00Z'
      },
      {
        store: 'Best Buy',
        price: 499.99,
        currency: 'USD',
        url: 'https://bestbuy.com/xboxseriesx',
        inStock: true,
        lastUpdated: '2024-01-15T09:10:00Z'
      },
      {
        store: 'Walmart',
        price: 489.99,
        currency: 'USD',
        url: 'https://walmart.com/xboxseriesx',
        inStock: true,
        lastUpdated: '2024-01-15T11:10:00Z'
      },
      {
        store: 'Microsoft Store',
        price: 499.99,
        currency: 'USD',
        url: 'https://microsoft.com/xboxseriesx',
        inStock: true,
        lastUpdated: '2024-01-15T08:20:00Z'
      },
      {
        store: 'GameStop',
        price: 499.99,
        currency: 'USD',
        url: 'https://gamestop.com/xboxseriesx',
        inStock: true,
        lastUpdated: '2024-01-15T10:45:00Z'
      }
    ]
  },
  {
    id: '7',
    name: 'Google Pixel 8 Pro',
    description: '6.7-inch Super Actua display. Google Tensor G3 chip. 50MP camera with Magic Eraser. 7 years of updates.',
    category: 'Smartphones',
    brand: 'Google',
    imageUrl: 'https://example.com/pixel8pro.jpg',
    specifications: {
      'Storage': '256GB',
      'Color': 'Obsidian',
      'Display': '6.7-inch Super Actua',
      'Chip': 'Google Tensor G3',
      'Camera': '50MP Main, 48MP Ultra Wide, 48MP Telephoto'
    },
    prices: [
      {
        store: 'Amazon',
        price: 999.00,
        currency: 'USD',
        url: 'https://amazon.com/pixel8pro',
        inStock: true,
        lastUpdated: '2024-01-15T10:25:00Z'
      },
      {
        store: 'Best Buy',
        price: 999.00,
        currency: 'USD',
        url: 'https://bestbuy.com/pixel8pro',
        inStock: true,
        lastUpdated: '2024-01-15T09:35:00Z'
      },
      {
        store: 'Google Store',
        price: 999.00,
        currency: 'USD',
        url: 'https://store.google.com/pixel8pro',
        inStock: true,
        lastUpdated: '2024-01-15T08:10:00Z'
      },
      {
        store: 'Verizon',
        price: 949.00,
        currency: 'USD',
        url: 'https://verizon.com/pixel8pro',
        inStock: true,
        lastUpdated: '2024-01-15T11:40:00Z'
      }
    ]
  },
  {
    id: '8',
    name: 'Lenovo ThinkPad X1 Carbon',
    description: '14-inch 2.8K OLED display. Intel Core i7-1355U. Ultra-lightweight design. Enterprise-grade security.',
    category: 'Laptops',
    brand: 'Lenovo',
    imageUrl: 'https://example.com/thinkpadx1.jpg',
    specifications: {
      'Processor': 'Intel Core i7-1355U',
      'Memory': '16GB LPDDR5',
      'Storage': '512GB SSD',
      'Display': '14-inch 2.8K OLED',
      'Weight': '2.48 lbs'
    },
    prices: [
      {
        store: 'Amazon',
        price: 1599.99,
        currency: 'USD',
        url: 'https://amazon.com/thinkpadx1',
        inStock: true,
        lastUpdated: '2024-01-15T10:35:00Z'
      },
      {
        store: 'Best Buy',
        price: 1599.99,
        currency: 'USD',
        url: 'https://bestbuy.com/thinkpadx1',
        inStock: true,
        lastUpdated: '2024-01-15T09:50:00Z'
      },
      {
        store: 'Lenovo Store',
        price: 1599.99,
        currency: 'USD',
        url: 'https://lenovo.com/thinkpadx1',
        inStock: true,
        lastUpdated: '2024-01-15T08:40:00Z'
      },
      {
        store: 'B&H Photo',
        price: 1549.99,
        currency: 'USD',
        url: 'https://bhphotovideo.com/thinkpadx1',
        inStock: true,
        lastUpdated: '2024-01-15T11:50:00Z'
      }
    ]
  }
];
