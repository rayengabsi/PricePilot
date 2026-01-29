# PricePilot Web

Next.js 14 frontend for PricePilot — AI-powered price comparison platform.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (API client)
- **React Hook Form** + **Zod** (forms & validation)
- **Zustand** (auth state, persisted)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.local.example` to `.env.local` and set:

   - `NEXT_PUBLIC_API_URL` — backend API base URL (default: `http://localhost:3000/api`)

3. **Run the backend**

   Ensure the PricePilot API is running at `http://localhost:3000` (see `apps/api`).

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   App runs at [http://localhost:3001](http://localhost:3001).

## Project structure

```
src/
├── app/              # Next.js 14 App Router
│   ├── (auth)/       # Login, Register (public)
│   ├── (dashboard)/  # Dashboard, Search, Alerts, Profile (protected)
│   ├── layout.tsx
│   └── page.tsx      # Landing
├── components/       # Reusable UI
│   ├── layout/       # Header, AuthGuard, AuthHydration
│   └── ui/           # Button, Input, LoadingSpinner
├── lib/              # API client, auth store
└── styles/           # globals.css (Tailwind)
```

## Features

- **Auth**: Login / Register with JWT (backend at `/api/auth/login`, `/api/auth/register`)
- **Dashboard**: Overview and links to Search, Alerts, Profile
- **Protected routes**: Dashboard, Search, Alerts, Profile require login
- **Design**: Purple/blue theme, responsive, loading and error states

## API

Backend base URL: `http://localhost:3000`. Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- User: `GET /api/users/profile` (Bearer token)
- Alerts: `GET/POST/DELETE /api/alerts` (Bearer token)
- Search: `GET /api/search?q=...`
