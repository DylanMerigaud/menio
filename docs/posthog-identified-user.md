# PostHog Identified User Best Practices

This document outlines our implementation of PostHog user identification and event tracking in Menio.

## User Identification Implementation

Properly identifying users in PostHog allows us to:

1. Track user journeys through our product
2. Segment users based on their properties
3. Enable personalized feature flags
4. Analyze conversion rates and user behavior

### How We Identify Users

We identify users in `PostHogProvider.tsx` when they're logged in:

```typescript
// When user is signed in with Clerk
posthog.identify(userId, {
  email: owner.email,
  name: `${owner.firstName} ${owner.lastName}`.trim(),
  companyName: owner.companyName,
  restaurantName: restaurant?.name,
  // Enhanced properties
  restaurantPublished: !!restaurant?.published,
  restaurantSlug: restaurant?.slug,
});

// Register super properties for all events
posthog.register({
  restaurantId: restaurant?.id,
  restaurantSlug: restaurant?.slug,
  ownerId: owner.id,
});
```

### Updating User Properties

For user properties that change over time, we use `posthog.people.set()` to update properties without re-identifying the user:

```typescript
// Function to update properties
export function updateUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.people.set(properties);
  }
}
```

We use this in key conversion events:

```typescript
// When restaurant is published
updateUserProperties({
  restaurantPublished: true,
  publishedAt: new Date().toISOString(),
});

// When subscription is activated
updateUserProperties({
  subscriptionStatus: 'active',
  subscriptionPlan: 'monthly',
  subscriptionStartedAt: new Date().toISOString(),
});
```

### Reset on Logout

We properly reset user identification on logout:

```typescript
export function resetPostHogUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset(true); // Reset with true parameter resets device_id too
  }
}
```

## Event Tracking

### Key Events We Track

1. **Authentication**
   - `user_signed_in`
   - `user_signed_up`
   - `user_signed_out`

2. **Onboarding**
   - `onboarding_step_view`
   - `onboarding_step_complete`

3. **Restaurant Management**
   - `restaurant_publish`
   - `restaurant_unpublish`
   - `restaurant_preview`

4. **Subscription**
   - `subscription_init`
   - `subscription_checkout_start`
   - `subscription_checkout_complete`

5. **Website Activity**
   - `restaurant_website_view`
   - `menu_view`
   - `image_gallery_view`
   - `social_link_click`

### Event Properties

We include detailed contextual properties with each event:

```typescript
// Example: Restaurant Publish
captureEvent('restaurant_publish', {
  slug,
  success,
  publishedAt: success ? new Date().toISOString() : undefined,
  ...(error && { error }),
});
```

## Best Practices We Follow

1. **Consistent User Identification**
   - We use Clerk `userId` as the unique identifier
   - We include all relevant user properties
   - We update properties when they change

2. **Proper Event Naming**
   - We use snake_case for event names
   - Events clearly describe the action
   - Actions have corresponding start/complete events

3. **Rich Property Data**
   - We include timestamps with events
   - We track success/failure status
   - We include contextual data (restaurant slug, etc.)
   - We capture error information when relevant

4. **Super Properties**
   - We use super properties for data that should be included with all events
   - This ensures consistent tracking across all events

5. **Reset on Logout**
   - We properly reset user identification on logout
   - This prevents mixed user data in analytics

## Improvements Made

1. Added enhanced user properties to identification
2. Implemented `updateUserProperties` for property updates
3. Added super properties registration
4. Enhanced event tracking with more detailed properties
5. Added automatic user property updates with key events

## References

- [PostHog Identifying Users](https://posthog.com/docs/integrate/identifying-users)
- [PostHog User Properties](https://posthog.com/docs/data/user-properties)
- [PostHog Super Properties](https://posthog.com/docs/libraries/js#super-properties)
- [PostHog Event Tracking](https://posthog.com/docs/product-analytics/capture-events)