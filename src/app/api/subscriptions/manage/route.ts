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
    // Get user ID from Clerk session
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get owner info
    const owner = await db.owner.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Get restaurant info including the stripe_customer_id
    const restaurant = await db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    })

    if (!restaurant?.stripeCustomerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Create a Stripe customer portal session - simplified for now
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Error accessing subscription management:', error)
    return NextResponse.json(
      { error: 'Failed to access subscription management' },
      { status: 500 },
    )
  }
}
