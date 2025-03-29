import { type inferAsyncReturnType } from '@trpc/server'
import { auth } from '@clerk/nextjs/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { db } from './db'
import Stripe from 'stripe'

// Initialize Stripe with type declarations
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Use a valid version string
})

// Type for the context that includes Stripe
export interface ContextWithStripe {
  db: typeof db
  session: Awaited<ReturnType<typeof auth>>
  stripe: Stripe
  userId: string | null
  headers: Headers
}

/**
 * This is the actual context you will use in your router
 * @link https://trpc.io/docs/server/context
 */
export async function createTRPCContext(opts: {
  headers: Headers
}): Promise<ContextWithStripe> {
  // Get the session from Clerk
  const session = await auth()

  return {
    db,
    session,
    stripe: stripeClient,
    userId: session?.userId,
    ...opts,
  }
}

// Context for RSC
export async function createContext(opts?: FetchCreateContextFnOptions) {
  const headers = new Headers(opts?.req?.headers)

  if (!headers.has('x-trpc-source')) {
    headers.set('x-trpc-source', 'rsc')
  }

  return createTRPCContext({ headers })
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>
