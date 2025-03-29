import Stripe from 'stripe'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/server/db'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export async function POST() {
  try {
    // Get user ID and email from Clerk session
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get owner info for the user
    const owner = await db.owner.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        email: true,
      },
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Get restaurant info for the owner
    const restaurant = await db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 },
      )
    }

    // Get or create a Stripe customer
    let customerId = restaurant.stripeCustomerId

    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: owner.email || user.primaryEmailAddress?.emailAddress,
        name: restaurant.name,
        phone: user.primaryPhoneNumber?.phoneNumber,
        metadata: {
          restaurant_id: restaurant.id,
          user_id: userId,
        },
      })

      customerId = customer.id

      // Save the customer ID to the database
      await db.restaurant.update({
        where: {
          id: restaurant.id,
        },
        data: {
          stripeCustomerId: customerId,
        },
      })
    }

    // Check if user had a previous subscription (using subscriptionStatus field in Restaurant)
    const hadPreviousSubscription = restaurant.subscriptionStatus !== null

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?subscription=canceled`,
      customer: customerId,
      subscription_data: {
        // Only provide trial if this is their first subscription
        ...(hadPreviousSubscription
          ? {}
          : {
              // Using trial_settings to require payment method for trial
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
        user_id: userId,
      },
      allow_promotion_codes: true, // Allow users to enter promo codes
    })

    return NextResponse.json({
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 },
    )
  }
}
