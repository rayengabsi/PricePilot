# 🚀 PricePilot – AI-Powered Price Comparison Platform

A full-stack price comparison platform that helps users find the best product prices using **AI-powered search** (OpenAI API). Includes a **Flutter mobile app** for customers, a **Next.js dashboard** for businesses, and a **Node.js backend** with PostgreSQL.

---

## ✨ Key Features

- **AI-Powered Product Matching** – Intelligent search using OpenAI API
- **Real-Time Price Comparison** – Compare products across multiple sources
- **Scalable REST APIs** – Designed for high-performance data processing
- **Cross-Platform Mobile App** – Built with Flutter for iOS and Android
- **Business Dashboard** – Next.js interface for product and price management
- **Clean Architecture** – Monorepo structure with shared code libraries

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Mobile** | Flutter, Dart, Riverpod |
| **Web Dashboard** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend API** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Redis |
| **AI & Search** | OpenAI API, Vector Embeddings |
| **Deployment** | Docker, Vercel, Railway |

---

## 📁 Project Structure
pricepilot/
├── apps/
│ ├── api/ # Backend API (Node.js + Express)
│ ├── pilot-mobile/ # Flutter mobile app
│ └── pilot-web/ # Next.js web dashboard
├── packages/
│ ├── shared-types/ # TypeScript interfaces
│ ├── ui-core/ # Shared UI components
│ └── config/ # Configuration files
├── docs/ # Documentation
└── tools/ # Development tools

text

---

## 🚀 Quick Start

``bash
# Clone the repository
git clone https://github.com/rayengabsi/PricePilot.git
cd PricePilot

# Install dependencies
npm install

# Build shared types
cd packages/shared-types && npm run build
cd ../..

# Run development servers
npm run dev:api      # Start backend API (port 3001)
npm run dev:web      # Start web dashboard (port 3000)

# Run mobile app
cd apps/pilot-mobile
flutter pub get
flutter run
📱 Applications
Application	Technology	Purpose
API	Node.js + Express	AI-powered search, product matching
Pilot Mobile	Flutter	Customer app for price comparison
Pilot Web	Next.js	Business dashboard for product management
🤖 AI Integration
PricePilot uses OpenAI API to:

Understand natural language product queries
Match user intent with relevant products
Provide accurate price comparisons and recommendations

🔗 Links
GitHub: github.com/rayengabsi/PricePilot

👨‍💻 Author
Rayen Gabsi

Email: rayen.gabsi@esprit.tn
GitHub: github.com/rayengabsi
LinkedIn: linkedin.com/in/gabsi-rayen
