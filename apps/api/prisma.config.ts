/**
 * Prisma Configuration
 * Connection URL for Prisma Migrate
 * Prisma 7.x requires connection URLs to be in this file instead of schema.prisma
 */

import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/pricepilot',
  },
});
