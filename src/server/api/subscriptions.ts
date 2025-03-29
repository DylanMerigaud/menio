import { protectedProcedure, createTRPCRouter } from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'

export const subscriptionsRouter = createTRPCRouter({
  // Get current subscription status
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    // Find the owner based on Clerk user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: { id: true },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Get restaurant by owner ID with subscription details
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        trialEnd: true,
        lastPaymentStatus: true,
        lastPaymentDate: true,
        published: true,
      },
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    // If there's a Stripe subscription ID, fetch the latest details from Stripe
    let stripeSubscription = null
    if (restaurant.stripeSubscriptionId) {
      try {
        stripeSubscription = await ctx.stripe.subscriptions.retrieve(
          restaurant.stripeSubscriptionId,
        )
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error)
      }
    }

    // Use only Stripe's trial end date
    const trialEndDate = restaurant.trialEnd || null

    const now = new Date()
    const isInFreeTrial =
      trialEndDate && restaurant.subscriptionStatus === 'TRIALING'
        ? now < trialEndDate
        : false

    // Determine overall subscription status
    const hasActiveSubscription =
      restaurant.subscriptionStatus === 'ACTIVE' ||
      restaurant.subscriptionStatus === 'TRIALING' ||
      restaurant.subscriptionStatus === 'PAST_DUE' // Give grace period for past_due

    const canPublish =
      (isInFreeTrial && restaurant.subscriptionStatus !== 'CANCELED') ||
      hasActiveSubscription

    return {
      restaurant: restaurant.id,
      status: restaurant.subscriptionStatus,
      hasActiveSubscription,
      isInFreeTrial,
      trialEndDate: trialEndDate,
      canPublish,
      stripeSubscription: stripeSubscription
        ? {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            currentPeriodEnd: new Date(
              (stripeSubscription as unknown as { current_period_end: number })
                .current_period_end * 1000,
            ),
            cancelAtPeriodEnd: !!(
              stripeSubscription as unknown as { cancel_at_period_end: boolean }
            ).cancel_at_period_end,
          }
        : null,
    }
  }),

  // Create checkout session for subscription
  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Find the owner based on Clerk user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: { id: true, email: true },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Get restaurant info
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        trialEnd: true,
        subscriptionStatus: true,
      },
    })

    if (!restaurant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant not found',
      })
    }

    // Get or create a Stripe customer
    let customerId = restaurant.stripeCustomerId

    if (!customerId) {
      // Create a new customer
      const customer = await ctx.stripe.customers.create({
        email: owner.email || undefined,
        name: restaurant.name,
        metadata: {
          restaurant_id: restaurant.id,
          user_id: ctx.session.userId,
        },
      })

      customerId = customer.id

      // Save the customer ID to the database
      await ctx.db.restaurant.update({
        where: {
          id: restaurant.id,
        },
        data: {
          stripeCustomerId: customerId,
        },
      })
    }

    // Check if restaurant has already had a trial
    const hasHadTrial =
      restaurant.trialEnd !== null ||
      restaurant.subscriptionStatus === 'CANCELED'

    // Create a Stripe Checkout session
    const checkoutSession = await ctx.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // This should be configured in Stripe as a monthly recurring price
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscription=canceled`,
      customer: customerId,
      subscription_data: {
        // Only include trial if restaurant hasn't had one before
        ...(hasHadTrial
          ? {}
          : {
              trial_period_days: 30, // 1 month free trial configured in Stripe
              trial_settings: {
                end_behavior: {
                  missing_payment_method: 'cancel', // Cancel if no payment method after trial
                },
              },
            }),
        metadata: {
          restaurant_id: restaurant.id,
        },
      },
      payment_method_collection: 'always', // Always require payment method, even for trials
      metadata: {
        restaurant_id: restaurant.id,
        user_id: ctx.session.userId,
        had_trial: hasHadTrial ? 'true' : 'false',
      },
      allow_promotion_codes: true, // Allow users to enter promo codes
    })

    return {
      url: checkoutSession.url,
    }
  }),

  // Create customer portal session for managing subscription
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Find the owner based on Clerk user ID
    const owner = await ctx.db.owner.findFirst({
      where: {
        userId: ctx.session.userId,
      },
      select: { id: true },
    })

    if (!owner) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Owner not found',
      })
    }

    // Get restaurant info with Stripe customer ID
    const restaurant = await ctx.db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    })

    if (!restaurant?.stripeCustomerId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Restaurant or customer ID not found',
      })
    }

    // Create a Stripe Customer Portal session
    const portalSession = await ctx.stripe.billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })

    return {
      url: portalSession.url,
    }
  }),
})
