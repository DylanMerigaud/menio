import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { db } from '@/server/db'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  // Headers must be accessed synchronously
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${errorMessage}`)
    console.error(
      `Webhook Secret used: ${webhookSecret ? 'Secret is set (but might be incorrect)' : 'Secret is not set'}`,
    )
    console.error(
      `Make sure you've set the correct STRIPE_WEBHOOK_SECRET in your .env.local file`,
    )
    console.error(
      `For local development, use the secret provided by the Stripe CLI`,
    )
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 },
    )
  }

  // Handle different webhook events
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error handling webhook: ${errorMessage}`)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 },
    )
  }
}

// Handler functions for different webhook events

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata?.restaurant_id
  if (!restaurantId) {
    console.error('No restaurant ID in subscription metadata')
    return
  }

  // Map Stripe subscription status to our SubscriptionStatus enum
  const statusMapping: Record<
    Stripe.Subscription.Status,
    | 'ACTIVE'
    | 'PAST_DUE'
    | 'UNPAID'
    | 'CANCELED'
    | 'INCOMPLETE'
    | 'INCOMPLETE_EXPIRED'
    | 'TRIALING'
    | 'PAUSED'
  > = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    unpaid: 'UNPAID',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    trialing: 'TRIALING',
    paused: 'PAUSED',
  }

  // Set published state based on subscription status
  const isPublished = ['ACTIVE', 'TRIALING'].includes(
    statusMapping[subscription.status],
  )

  // Update restaurant record with subscription details from Stripe
  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      subscriptionStatus: statusMapping[subscription.status],
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      published: isPublished, // Only publish when subscription is active or trialing
    },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find restaurant by subscription ID
  const restaurant = await db.restaurant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  })

  let restaurantId = restaurant?.id

  if (!restaurantId) {
    console.error(`No restaurant found for subscription ${subscription.id}`)
    // Try to find by customer ID
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id

    const byCustomer = await db.restaurant.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    })

    if (!byCustomer) {
      console.error(`No restaurant found for customer ${customerId}`)
      return
    }

    restaurantId = byCustomer.id
  }

  // Map Stripe subscription status to our SubscriptionStatus enum
  const statusMapping: Record<
    Stripe.Subscription.Status,
    | 'ACTIVE'
    | 'PAST_DUE'
    | 'UNPAID'
    | 'CANCELED'
    | 'INCOMPLETE'
    | 'INCOMPLETE_EXPIRED'
    | 'TRIALING'
    | 'PAUSED'
  > = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    unpaid: 'UNPAID',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'INCOMPLETE_EXPIRED',
    trialing: 'TRIALING',
    paused: 'PAUSED',
  }

  // Set published state based on subscription status
  const isPublished = ['ACTIVE', 'TRIALING'].includes(
    statusMapping[subscription.status],
  )

  // Update subscription details directly from Stripe
  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: statusMapping[subscription.status],
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      published: isPublished, // Update published status based on subscription state
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Find restaurant by subscription ID
  const restaurant = await db.restaurant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  })

  if (!restaurant) {
    console.error(`No restaurant found for subscription ${subscription.id}`)
    return
  }

  // Update restaurant record
  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      subscriptionStatus: 'CANCELED',
      published: false, // Unpublish when subscription is canceled
    },
  })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // For Stripe API, subscription might be in metadata or as a property
  const subscriptionField = 'subscription' as keyof typeof invoice
  const subscription = invoice[subscriptionField] as string | undefined

  if (!subscription) return

  const subscriptionId = subscription

  // Find restaurant by subscription ID
  const restaurant = await db.restaurant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    select: { id: true },
  })

  if (!restaurant) {
    console.error(`No restaurant found for subscription ${subscriptionId}`)
    return
  }

  // Update payment status
  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      lastPaymentStatus: 'succeeded',
      lastPaymentDate: new Date(),
    },
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // For Stripe API, subscription might be in metadata or as a property
  const subscriptionField = 'subscription' as keyof typeof invoice
  const subscription = invoice[subscriptionField] as string | undefined

  if (!subscription) return

  const subscriptionId = subscription

  // Find restaurant by subscription ID
  const restaurant = await db.restaurant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    select: { id: true },
  })

  if (!restaurant) {
    console.error(`No restaurant found for subscription ${subscriptionId}`)
    return
  }

  // Update payment status
  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      lastPaymentStatus: 'failed',
    },
  })

  // Could also send notifications to restaurant owner about failed payment
}
