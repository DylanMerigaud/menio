# Stripe Integration Documentation for Menio

This document outlines the Stripe integration in the Menio application for managing restaurant subscriptions.

## Overview

Menio uses Stripe to:

- Handle subscription payments (€30/month)
- Manage subscription lifecycle
- Provide a 30-day free trial period
- Control access to premium features based on subscription status

## Technical Implementation

### Database Schema

The `Restaurant` model in Prisma includes fields for tracking subscription details:

```prisma
enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
  INCOMPLETE_EXPIRED
  PAUSED
}

model Restaurant {
  // ...existing fields
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  subscriptionStatus    SubscriptionStatus?
  trialEnd              DateTime?
  lastPaymentStatus     String?
  lastPaymentDate       DateTime?
  // ...other fields
}
```

### API Endpoints

#### tRPC Endpoints

The subscription functionality is exposed through tRPC endpoints in `/src/server/api/subscriptions.ts`:

```typescript
export const subscriptionsRouter = createTRPCRouter({
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    // Returns subscription status, trial information, etc.
  }),

  createCheckoutSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Creates a Stripe Checkout session for new subscriptions
  }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Creates a Stripe Customer Portal session for managing existing subscriptions
  }),
})
```

#### REST API Routes

For direct Stripe interactions:

- `/api/subscriptions/create/route.ts`: Creates Stripe Checkout sessions
- `/api/subscriptions/manage/route.ts`: Creates Stripe Customer Portal sessions

### Webhook Handler

The `/api/webhooks/stripe/route.ts` endpoint handles Stripe webhook events:

- `customer.subscription.created`: Initializes subscription records
- `customer.subscription.updated`: Updates subscription status
- `customer.subscription.deleted`: Handles cancellations
- `invoice.paid`: Updates payment status
- `invoice.payment_failed`: Handles failed payments

### Access Control

Restaurant publishing is restricted based on subscription status:

```typescript
// In publishRestaurant mutation
if (input.published) {
  // Only allow publishing with active subscription or during free trial
  if (!isInFreeTrial && !hasActiveSubscription) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Cannot publish restaurant without an active subscription',
    })
  }
}
```

### UI Components

The dashboard displays subscription status and management options:

- Trial period countdown
- Subscribe button for new users
- Manage subscription button for existing subscribers
- Publishing restrictions based on subscription status

## Testing Stripe Integration

### Test Mode

1. Use Stripe test mode API keys in development
2. Test cards:
   - Success: `4242 4242 4242 4242`
   - Requires Authentication: `4000 0025 0000 3155`
   - Payment Failure: `4000 0000 0000 9995`

### Webhooks

For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Environment Variables

Required Stripe configuration:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_ID=prod_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Getting STRIPE_WEBHOOK_SECRET

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)

2. Go to the Developers section (left sidebar) → Webhooks

3. Click on "Add Endpoint"

4. Set up the endpoint:

   - Endpoint URL: Your webhook URL, e.g., `https://menio.app/api/webhooks/stripe` (for production)
   - Description: "Menio subscription webhooks"
   - Events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

5. After creating the endpoint, Stripe will generate a signing secret. This is your `STRIPE_WEBHOOK_SECRET`. It starts with `whsec_`.

6. Add this secret to your `.env.local` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### For Local Development (Stripe CLI)

1. [Install the Stripe CLI](https://stripe.com/docs/stripe-cli)

2. Login to your Stripe account via CLI:

   ```
   stripe login
   ```

3. Start the webhook forwarding:

   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI will output a webhook signing secret - use this for local development:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Subscription Workflow

1. **New User**:

   - Must provide credit card to start 30-day free trial
   - No charge during trial period
   - Can publish restaurant during trial
   - Prompted to subscribe before trial ends

2. **Trial Expiration**:

   - Credit card automatically charged at end of trial
   - Subscription converts to paid without interruption
   - If no payment method or payment fails, restaurant unpublished

3. **Active Subscriber**:

   - Full access to publishing and premium features
   - Can manage subscription through Customer Portal

4. **Subscription Cancellation**:
   - Restaurant automatically unpublished
   - Data remains for potential reactivation
