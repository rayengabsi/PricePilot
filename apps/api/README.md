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
- ✅ **Swagger/OpenAPI documentation** with interactive UI
- ✅ **PostgreSQL database** with Prisma ORM
- ✅ **User authentication** with JWT
- ✅ **Price alerts** with automatic scheduled checking
- ✅ **Automatic price monitoring** - checks alerts every hour

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The API will run on `http://localhost:3000`

### API Documentation

Interactive Swagger UI documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

The Swagger UI provides:
- Complete API documentation with all endpoints
- Interactive "Try it out" feature to test endpoints directly
- Request/response schemas and examples
- TypeScript interface definitions

## Database Setup

### 1. Create .env file

Copy `.env.example` to `.env` and update with your database credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pricepilot"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
CORS_ORIGIN="*"
ENABLE_PRICE_CHECK=true
PRICE_CHECK_INTERVAL="0 * * * *"
```

### 2. Setup Prisma

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed database with sample data
npm run prisma:seed
```

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
- `GET /api/health` - Returns API health status and database connection

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Users
- `GET /api/users/profile` - Get current user profile (requires JWT)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products/:id/update-price` - Update product price (for testing)
- `GET /api/search?q=query` - Search products
  - Query parameters:
    - `q` (required): Search query
    - `category` (optional): Filter by category
    - `minPrice` (optional): Minimum price filter
    - `maxPrice` (optional): Maximum price filter
- `POST /api/compare` - Compare multiple products
  - Body: `{ "productIds": ["1", "2", "3"] }`

### Price Alerts
- `POST /api/alerts` - Create price alert (requires JWT)
- `GET /api/alerts` - Get user's alerts (requires JWT)
- `GET /api/alerts/check` - Manually trigger alert check (requires JWT)
- `DELETE /api/alerts/:id` - Delete alert (requires JWT)

## Automatic Price Checking

The API includes an **automatic price checking scheduler** that runs in the background:

### Features
- ✅ Runs automatically every hour (configurable)
- ✅ Checks all active price alerts
- ✅ Triggers notifications when prices drop
- ✅ Prevents duplicate checks (won't run if already in progress)
- ✅ Comprehensive logging
- ✅ Can be disabled via environment variable

### Configuration

Set these environment variables in your `.env` file:

```env
# Enable/disable automatic price checking (default: true)
ENABLE_PRICE_CHECK=true

# Price check interval (cron format)
# Examples:
#   "0 * * * *" = every hour at minute 0
#   "0 */2 * * *" = every 2 hours
#   "*/30 * * * *" = every 30 minutes
# Default: "0 * * * *" (every hour)
PRICE_CHECK_INTERVAL="0 * * * *"
```

### How It Works

1. **Server starts** → Scheduler automatically starts
2. **Every hour** → System checks all active price alerts
3. **Price drops** → Alert is triggered and notification is sent
4. **Server stops** → Scheduler gracefully stops

### Manual Check

You can still manually trigger a check via the API:

```bash
curl -X GET http://localhost:3000/api/alerts/check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Logging

The scheduler logs:
- When checks start and complete
- Number of alerts checked
- Number of alerts triggered
- Duration of each check
- Any errors that occur

Example log output:
```
🔄 Starting scheduled price check...
✅ Price check completed in 1234ms - 2 alert(s) triggered
🔔 PRICE ALERT TRIGGERED!
   User: john@example.com
   Product: iPhone 15 Pro
   Target Price: $800
   Current Price: $799.99 at Walmart
```

## Project Structure

```
src/
├── config/          # Configuration files (Swagger, etc.)
├── controllers/     # Request handlers
├── routes/          # Route definitions
├── middleware/      # Custom middleware (auth, error handling)
├── services/        # Business logic services
│   ├── database.service.ts
│   ├── priceAlert.service.ts
│   └── scheduler.service.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and mock data
└── index.ts         # Application entry point
```

## Technologies

- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger UI Express
- Swagger JSDoc
- node-cron (scheduled tasks)
- bcrypt (password hashing)
- CORS
- Helmet

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |
| `ENABLE_PRICE_CHECK` | Enable automatic price checking | `true` |
| `PRICE_CHECK_INTERVAL` | Cron expression for check interval | `"0 * * * *"` |

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Price Alert
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"PRODUCT_ID","targetPrice":800.00}'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Search Products
```bash
curl "http://localhost:3000/api/search?q=iphone"
```

### Compare Products
```bash
curl -X POST http://localhost:3000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["1", "2"]}'
```

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Create migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Setup everything at once
npm run db:setup
```

## License

ISC
