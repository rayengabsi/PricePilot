# 🏗️ PricePilot System Architecture

## Overview
PricePilot is a modern, AI-powered price comparison platform built as a monorepo.

## Technology Stack
### Backend Layer
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful
- **Authentication**: JWT + Refresh tokens

### AI Layer
- **Semantic Search**: OpenAI embeddings
- **Recommendations**: Collaborative filtering

### Data Layer
- **Primary DB**: PostgreSQL
- **Cache**: Redis

### Client Layer
- **Mobile**: Flutter (iOS & Android)
- **Web**: Next.js 14 (App Router)
