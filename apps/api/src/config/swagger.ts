/**
 * Swagger/OpenAPI Configuration
 * Configures Swagger UI and API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PricePilot API',
      version: '1.0.0',
      description: 'A comprehensive REST API for price comparison across multiple retailers. Compare prices, search products, and find the best deals.',
      contact: {
        name: 'PricePilot API Support',
        email: 'support@pricepilot.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.pricepilot.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Products',
        description: 'Product management and retrieval endpoints'
      },
      {
        name: 'Search',
        description: 'Product search and filtering endpoints'
      },
      {
        name: 'Compare',
        description: 'Product comparison endpoints'
      }
    ],
    components: {
      schemas: {
        Price: {
          type: 'object',
          properties: {
            store: {
              type: 'string',
              description: 'Name of the store',
              example: 'Amazon'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Product price',
              example: 999.99
            },
            currency: {
              type: 'string',
              description: 'Currency code',
              example: 'USD'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Product URL at the store',
              example: 'https://amazon.com/product'
            },
            inStock: {
              type: 'boolean',
              description: 'Product availability status',
              example: true
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last price update timestamp',
              example: '2024-01-15T10:30:00Z'
            }
          },
          required: ['store', 'price', 'currency', 'url', 'inStock', 'lastUpdated']
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique product identifier',
              example: '1'
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'iPhone 15 Pro'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: '6.1-inch Super Retina XDR display with ProMotion.'
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Smartphones'
            },
            brand: {
              type: 'string',
              description: 'Product brand',
              example: 'Apple'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Product image URL',
              example: 'https://example.com/product.jpg'
            },
            prices: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Price'
              },
              description: 'List of prices from different stores'
            },
            specifications: {
              type: 'object',
              additionalProperties: {
                type: 'string'
              },
              description: 'Product specifications',
              example: {
                Storage: '256GB',
                Color: 'Natural Titanium'
              }
            }
          },
          required: ['id', 'name', 'description', 'category', 'brand', 'prices']
        },
        ProductsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            count: {
              type: 'integer',
              description: 'Number of products returned',
              example: 8
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            }
          }
        },
        ProductResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Product'
            }
          }
        },
        SearchResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            query: {
              type: 'string',
              description: 'Search query used',
              example: 'iphone'
            },
            count: {
              type: 'integer',
              description: 'Number of results',
              example: 2
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            }
          }
        },
        CompareRequest: {
          type: 'object',
          required: ['productIds'],
          properties: {
            productIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of product IDs to compare',
              example: ['1', '2', '3'],
              minItems: 1
            }
          }
        },
        CheapestPrice: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              example: '1'
            },
            store: {
              type: 'string',
              example: 'Walmart'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 979.00
            }
          }
        },
        PriceRange: {
          type: 'object',
          properties: {
            min: {
              type: 'number',
              format: 'float',
              example: 979.00
            },
            max: {
              type: 'number',
              format: 'float',
              example: 1199.99
            }
          }
        },
        Comparison: {
          type: 'object',
          properties: {
            cheapest: {
              $ref: '#/components/schemas/CheapestPrice'
            },
            priceRange: {
              $ref: '#/components/schemas/PriceRange'
            }
          }
        },
        CompareResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                products: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                },
                comparison: {
                  $ref: '#/components/schemas/Comparison'
                }
              }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'healthy'
            },
            service: {
              type: 'string',
              example: 'PricePilot API'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            },
            error: {
              type: 'string',
              description: 'Detailed error information (only in development)'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
