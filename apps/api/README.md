# PricePilot API

A complete Express.js + TypeScript API for price comparison, built for the PricePilot monorepo.

## Features

- ✅ Express.js with TypeScript
- ✅ RESTful API endpoints for products and price comparison
- ✅ Realistic mock data with multiple stores (Amazon, Best Buy, Walmart, etc.)
- ✅ Search functionality with filtering
- ✅ Product comparison with price analysis
- ✅ Security middleware (Helmet, CORS)
- ✅ Error handling
- ✅ Health check endpoint

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The API will run on `http://localhost:3000`

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Returns API health status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product by ID
- `GET /api/search?q=query` - Search products
  - Query parameters:
    - `q` (required): Search query
    - `category` (optional): Filter by category
    - `minPrice` (optional): Minimum price filter
    - `maxPrice` (optional): Maximum price filter
- `POST /api/compare` - Compare multiple products
  - Body: `{ "productIds": ["1", "2", "3"] }`

## Example Requests

### Get all products
```bash
curl http://localhost:3000/api/products
```

### Get product by ID
```bash
curl http://localhost:3000/api/products/1
```

### Search products
```bash
curl "http://localhost:3000/api/products/search?q=iphone"
```

### Compare products
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["1", "2"]}'
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── routes/          # Route definitions
├── middleware/      # Custom middleware
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and mock data
└── index.ts         # Application entry point
```

## Technologies

- Express.js
- TypeScript
- CORS
- Helmet
- dotenv
