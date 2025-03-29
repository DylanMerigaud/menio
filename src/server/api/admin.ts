import { protectedProcedure, createTRPCRouter } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

export const adminRouter = createTRPCRouter({
  getAllOwnersWithRestaurants: protectedProcedure.query(async ({ ctx }) => {
    // Check if the current user is an admin
    const currentOwner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: {
        isAdmin: true,
      },
    })

    if (!currentOwner?.isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You must be an admin to access this resource',
      })
    }

    // Get all owners with their restaurants and addresses
    const owners = await ctx.db.owner.findMany({
      include: {
        restaurants: {
          include: {
            addressInfo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Enhance data with subscription info from Stripe where available
    const ownersWithEnhancedData = await Promise.all(
      owners.map(async (owner) => {
        const enhancedRestaurants = await Promise.all(
          owner.restaurants.map(async (restaurant) => {
            let stripeSubscription = null

            // If there's a Stripe subscription ID, fetch the details
            if (restaurant.stripeSubscriptionId) {
              try {
                stripeSubscription = await ctx.stripe.subscriptions.retrieve(
                  restaurant.stripeSubscriptionId,
                )
              } catch (error) {
                console.error('Error fetching subscription from Stripe:', error)
              }
            }

            // Calculate subscription status details
            const trialEndDate = restaurant.trialEnd || null
            const now = new Date()
            const isInFreeTrial =
              trialEndDate && restaurant.subscriptionStatus === 'TRIALING'
                ? now < trialEndDate
                : false

            const hasActiveSubscription =
              restaurant.subscriptionStatus === 'ACTIVE' ||
              restaurant.subscriptionStatus === 'TRIALING' ||
              restaurant.subscriptionStatus === 'PAST_DUE'

            return {
              ...restaurant,
              subscriptionDetails: {
                hasActiveSubscription,
                isInFreeTrial,
                trialEndDate,
                stripeSubscription: stripeSubscription
                  ? {
                      id: stripeSubscription.id,
                      status: stripeSubscription.status,
                      currentPeriodEnd: new Date(
                        (
                          stripeSubscription as unknown as {
                            current_period_end: number
                          }
                        ).current_period_end * 1000,
                      ),
                      cancelAtPeriodEnd: !!(
                        stripeSubscription as unknown as {
                          cancel_at_period_end: boolean
                        }
                      ).cancel_at_period_end,
                      // Add the start date from Stripe
                      startDate: new Date(
                        (
                          stripeSubscription as unknown as {
                            start_date: number
                          }
                        ).start_date * 1000,
                      ),
                      // Add created date from Stripe
                      created: new Date(
                        (stripeSubscription as unknown as { created: number })
                          .created * 1000,
                      ),
                    }
                  : null,
              },
            }
          }),
        )

        return {
          ...owner,
          restaurants: enhancedRestaurants,
        }
      }),
    )

    return ownersWithEnhancedData
  }),
})
