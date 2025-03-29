# Clerk-Prisma Integration for Menio

This document outlines how Clerk authentication is integrated with Prisma in the Menio application.

## Architecture Overview

1. **Clerk**: Handles all user authentication (signup, login, session management)
2. **Prisma**: ORM for database access with Neon PostgreSQL
3. **Integration**: Clerk user IDs used to authenticate and authorize requests

## How It Works

1. User authenticates with Clerk (via SMS login)
2. Clerk provides a user ID and session
3. The authenticated user ID is passed to API routes and tRPC procedures
4. Backend code uses the authenticated user ID to authorize database operations
5. All data access is protected based on user ownership

## Setup Configuration

### 1. Clerk Authentication

Clerk handles all authentication aspects:

- User signup and login
- Session management
- Authentication middleware
- User profile data

### 2. Prisma Database Access

Prisma schema is designed with relations that support user ownership:

```prisma
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
  id              String      @id @default(uuid())
  name            String
  description     String?
  address         String
  slug            String      @unique
  ownerId         String
  published       Boolean     @default(false)
  stripeCustomerId String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  owner         Owner                  @relation(fields: [ownerId], references: [id])
  // Other relations...

  @@index([ownerId])
  @@index([slug])
  @@map("restaurants")
}
```

### 3. Authentication Middleware

Next.js middleware ensures authenticated routes are protected:

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  // Configuration for protected routes
  publicRoutes: ['/', '/restaurant/:slug', '/api/webhooks(.*)'],

  afterAuth(auth, req) {
    // Custom logic for handling authenticated/unauthenticated users
  },
})
```

### 4. tRPC Context with Authentication

The tRPC context integrates Clerk's auth with Prisma:

```typescript
// src/server/context.ts
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

## Implementation Details

### API Routes

In API routes, we use Clerk's auth helpers:

```typescript
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId: userId },
  })

  return Response.json({ restaurants })
}
```

### tRPC Procedures

tRPC procedures leverage the auth context:

```typescript
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const restaurantsRouter = router({
  getRestaurants: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restaurant.findMany({
      where: { ownerId: ctx.userId },
    })
  }),

  // Other procedures...
})
```

### Protected Procedures

tRPC has specific procedure types for authorization:

```typescript
// src/server/trpc.ts
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
      ctx: {
        ...ctx,
        userId: ctx.auth.userId,
      },
    })
  }),
)
```

## Testing the Integration

You can test the integration by:

1. Logging in with Clerk
2. Accessing protected routes
3. Verifying that data is properly filtered by user ownership
4. Checking that unauthorized access is properly rejected

## Troubleshooting

If you encounter authorization issues:

1. Verify that Clerk's auth middleware is properly configured
2. Check that the userId is being passed correctly to the tRPC context
3. Ensure protected procedures are being used for operations that require authentication
4. Confirm that database queries include the proper ownership filters
5. Check for any errors in the server logs related to auth
