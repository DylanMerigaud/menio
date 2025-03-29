import { z } from 'zod'
import {
  protectedProcedure,
  publicProcedure,
  createTRPCRouter,
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { getOnboardingState } from '@/services/onboarding'
import type { PrismaClient } from '@prisma/client'
import type { Owner } from '@prisma/client'

const OwnerSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  companyName: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().min(1).optional(),
})

export const ownersRouter = createTRPCRouter({
  getOnboardingState: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return getOnboardingState(input.userId)
    }),

  findOwner: protectedProcedure.query(async ({ ctx }) => {
    return findOwnerByUserId(ctx.db, ctx.session.userId)
  }),

  getOwner: protectedProcedure.query(async ({ ctx }) => {
    const owner = await findOwnerByUserId(ctx.db, ctx.session.userId)

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    return owner
  }),

  upsertOwner: protectedProcedure
    .input(OwnerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if owner already exists
        const existingOwner = await findOwnerByUserId(
          ctx.db,
          ctx.session.userId,
        )

        if (existingOwner) {
          // Update existing owner
          const updatedOwner = await ctx.db.owner.update({
            where: {
              id: existingOwner.id,
            },
            data: {
              firstName: input.firstName,
              lastName: input.lastName,
              companyName: input.companyName,
              email: input.email,
            },
          })

          return updatedOwner
        } else {
          // Create new owner
          const newOwner = await ctx.db.owner.create({
            data: {
              firstName: input.firstName,
              lastName: input.lastName,
              companyName: input.companyName,
              email: input.email,
              userId: ctx.session.userId,
            },
          })

          return newOwner
        }
      } catch (error) {
        console.error('Error in upsertOwner:', error)
        throw error
      }
    }),
})

async function findOwnerByUserId(
  db: PrismaClient,
  userId: string,
): Promise<Owner | null> {
  return db.owner.findFirst({
    where: {
      userId,
    },
  })
}
