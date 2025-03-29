import { ownersRouter } from './owners'
import { restaurantsRouter } from './restaurants'
import { subscriptionsRouter } from './subscriptions'
import { z } from 'zod'
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from '@/server/api/trpc'
import { adminRouter } from './admin'

export const appRouter = createTRPCRouter({
  owners: ownersRouter,
  restaurants: restaurantsRouter,
  subscriptions: subscriptionsRouter,
  admin: adminRouter,

  // Simple test procedure to verify API works
  hello: publicProcedure
    .input(z.object({ text: z.string() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? 'world'}`,
      }
    }),
})

export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API
 */
export const createCaller = createCallerFactory(appRouter)
