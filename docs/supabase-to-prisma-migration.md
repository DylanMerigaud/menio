# Supabase to Prisma Migration Guide

This document outlines how to migrate from Supabase to Prisma with Neon PostgreSQL and UploadThing.

## Overview

The migration process involves:

1. Setting up Prisma with Neon PostgreSQL
2. Migrating the database schema
3. Setting up UploadThing for file storage
4. Updating application code to use Prisma instead of Supabase
5. Migrating data from Supabase to Neon PostgreSQL
6. Clean up Supabase dependencies

## 1. Setting Up Prisma with Neon PostgreSQL

### Install Dependencies

```bash
# Install Prisma
npm install -D prisma
npm install @prisma/client

# Or with pnpm
pnpm add -D prisma
pnpm add @prisma/client
```

### Initialize Prisma

```bash
npx prisma init
```

### Configure Neon PostgreSQL Connection

Update your `.env` file with your Neon PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@your-neon-db-hostname:5432/database?sslmode=require"
```

## 2. Migrating the Database Schema

### Create Prisma Schema

Based on your Supabase schema, create a Prisma schema in `prisma/schema.prisma`. Example:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Owner {
  id           String       @id
  email        String?
  phone        String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  restaurants  Restaurant[]

  @@map("owners")
}

model Restaurant {
  id                String      @id @default(uuid())
  name              String
  description       String?
  address           String
  slug              String      @unique
  ownerId           String
  published         Boolean     @default(false)
  stripeCustomerId  String?
  stripeSubscriptionId String?
  subscriptionStatus String?
  trialEnd          DateTime?
  lastPaymentStatus String?
  lastPaymentDate   DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  owner         Owner                  @relation(fields: [ownerId], references: [id])
  openingHours  OpeningHours[]
  contactInfo   ContactInfo?
  images        RestaurantImage[]
  socialLinks   RestaurantSocialLink[]

  @@index([ownerId])
  @@index([slug])
  @@map("restaurants")
}

model OpeningHours {
  id           String     @id @default(uuid())
  restaurantId String
  day          Int
  isOpen       Boolean
  openTimes    Json
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@map("opening_hours")
}

model ContactInfo {
  id             String     @id @default(uuid())
  restaurantId   String     @unique
  phone          String?
  email          String?
  website        String?
  reservationUrl String?
  restaurant     Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@map("contact_info")
}

model RestaurantImage {
  id           String     @id @default(uuid())
  restaurantId String
  url          String
  displayOrder Int        @default(0)
  createdAt    DateTime   @default(now())
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@map("restaurant_images")
}

model RestaurantSocialLink {
  id           String     @id @default(uuid())
  restaurantId String
  platform     String
  url          String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@map("restaurant_social_links")
}
```

### Push Schema to Database

During development:

```bash
npx prisma db push
```

For production:

```bash
npx prisma migrate dev --name init
```

## 3. Setting Up UploadThing for File Storage

### Install Dependencies

```bash
# Install UploadThing
pnpm add uploadthing @uploadthing/react
```

### Configure UploadThing

Create a configuration file in `src/lib/uploadthing.ts`:

```typescript
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const uploadRouter = {
  // Define file routes
  restaurantImage: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      // Verify user is authenticated
      return { userId: 'user_id' } // Use actual user ID here
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  restaurantLogo: f({ image: { maxFileSize: '2MB' } })
    .middleware(async () => {
      return { userId: 'user_id' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  menuPdf: f({ pdf: { maxFileSize: '8MB' } })
    .middleware(async () => {
      return { userId: 'user_id' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
```

### Create API Route for UploadThing

Create a file in `src/app/api/uploadthing/route.ts`:

```typescript
import { createNextRouteHandler } from 'uploadthing/next'
import { uploadRouter } from '@/lib/uploadthing'

export const { GET, POST } = createNextRouteHandler({
  router: uploadRouter,
})
```

### Create Client-Side Components

Create a client-side integration in `src/lib/uploadthing-client.ts`:

```typescript
'use client'

import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from './uploadthing'

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
```

## 4. Updating Application Code

### Create Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Update tRPC Context

Update `src/server/context.ts`:

```typescript
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function createContext() {
  const { userId } = auth()

  return {
    prisma,
    userId,
    auth: {
      userId,
      isAuthenticated: !!userId,
    },
  }
}
```

### Update tRPC Routers

Update routers to use Prisma instead of Supabase. Example:

```typescript
// restaurants.ts
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'

export const restaurantsRouter = router({
  getRestaurant: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.restaurant.findUnique({
        where: { slug: input.slug },
        include: {
          openingHours: true,
          contactInfo: true,
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
          socialLinks: true,
        },
      })
    }),

  getMyRestaurants: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restaurant.findMany({
      where: { ownerId: ctx.userId },
    })
  }),

  // Add other procedures...
})
```

### Update API Routes

Update API routes to use Prisma. Example:

```typescript
// src/app/api/subscriptions/create/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { restaurantId } = await req.json()

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
        ownerId: userId,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 },
      )
    }

    // Stripe logic...

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
```

## 5. Migrating Data

Create a migration script in `scripts/migrate-supabase-to-prisma.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'
import * as fs from 'fs/promises'
import * as path from 'path'
import { uploadFiles } from '@/lib/uploadthing-client'

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
const prisma = new PrismaClient()

async function main() {
  // Migrate owners
  console.log('Migrating owners...')
  const { data: owners, error: ownersError } = await supabase
    .from('owners')
    .select('*')

  if (ownersError) {
    console.error('Error fetching owners:', ownersError)
    return
  }

  for (const owner of owners) {
    await prisma.owner.create({
      data: {
        id: owner.id,
        email: owner.email,
        phone: owner.phone,
        createdAt: new Date(owner.created_at),
        updatedAt: new Date(owner.updated_at || owner.created_at),
      },
    })
  }

  // Migrate restaurants and related data
  console.log('Migrating restaurants...')
  const { data: restaurants, error: restaurantsError } = await supabase
    .from('restaurants')
    .select('*')

  if (restaurantsError) {
    console.error('Error fetching restaurants:', restaurantsError)
    return
  }

  for (const restaurant of restaurants) {
    // Migrate restaurant
    await prisma.restaurant.create({
      data: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        slug: restaurant.slug,
        ownerId: restaurant.owner_id,
        published: restaurant.is_published || false,
        stripeCustomerId: restaurant.stripe_customer_id,
        stripeSubscriptionId: restaurant.stripe_subscription_id,
        subscriptionStatus: restaurant.subscription_status,
        trialEnd: restaurant.trial_end ? new Date(restaurant.trial_end) : null,
        lastPaymentStatus: restaurant.last_payment_status,
        lastPaymentDate: restaurant.last_payment_date
          ? new Date(restaurant.last_payment_date)
          : null,
        createdAt: new Date(restaurant.created_at),
        updatedAt: new Date(restaurant.updated_at || restaurant.created_at),
      },
    })

    // Migrate restaurant's opening hours, contact info, images, etc.
    // ... Additional migration code for related tables
  }

  console.log('Migration completed successfully')
}

// Run the migration
main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 6. Clean Up Supabase Dependencies

1. Remove Supabase packages from `package.json`:

```bash
pnpm remove @supabase/supabase-js @supabase/auth-helpers-nextjs
```

2. Remove Supabase environment variables from `.env` files.

3. Delete Supabase-specific files:

   - `src/utils/supabase/` directory
   - `src/hooks/useSupabase.ts`
   - `supabase/` directory (after successful migration)

4. Update or remove Supabase-specific components:
   - `src/components/ClerkSupabaseDebug.tsx`

## Testing

1. Test all functionality with Prisma and UploadThing
2. Verify data was migrated correctly
3. Check authentication workflow with Clerk
4. Test file uploads with UploadThing
5. Verify all API routes work as expected
