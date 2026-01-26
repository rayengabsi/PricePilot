# 🚀 PricePilot – AI-Powered Product Discovery & Price Comparison Platform

## 🏗️ Architecture

pricepilot/
├── apps/ # Deployable applications
│ ├── api/ # Backend API (Node.js + Express)
│ ├── pilot-mobile/ # Flutter mobile app
│ └── pilot-web/ # Next.js web dashboard
├── packages/ # Shared code libraries
│ ├── shared-types/ # TypeScript interfaces
│ ├── ui-core/ # Shared UI components
│ └── config/ # Configuration
├── docs/ # Documentation
└── tools/ # Development tools

## 🚀 Quick Start
See [Development Setup](docs/setup/development.md) for detailed instructions.

## 📱 Applications
- **API**: Backend service with AI-powered search
- **Pilot Mobile**: Flutter app for customers  
- **Pilot Web**: Next.js dashboard for businesses

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Mobile**: Flutter, Dart, Riverpod
- **Web**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI API, Vector embeddings
- **Database**: PostgreSQL, Redis
- **Deployment**: Docker, Vercel, Railway

## 📁 Project Structure
This is a **monorepo** containing all components of the PricePilot platform.
Shared code lives in `packages/` and is used by all applications.

## 📄 Documentation
- [System Architecture](docs/architecture/system-overview.md)
- [API Documentation](docs/api/overview.md)
- [Development Setup](docs/setup/development.md)

## 👨‍💻 Development
```bash
# Install dependencies
npm install

# Build shared types
cd packages/shared-types && npm run build

# Run development servers  
npm run dev:api      # Backend API
npm run dev:web      # Web dashboard
# Mobile: cd apps/pilot-mobile && flutter run
