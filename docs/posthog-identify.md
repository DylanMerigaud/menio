# PostHog Integration in menio

Last updated: April 18, 2025

## Overview

This document describes how PostHog is integrated into our Next.js application for analytics, user identification, and feature flags.

## Implementation Details

### Provider Setup

We've implemented PostHog following the recommended Next.js app router pattern:

1. A `PostHogProvider` component in `/src/providers/PostHogProvider.tsx` that:
   - Initializes PostHog with correct configuration
   - Identifies users using Clerk authentication
   - Provides utility functions for event capture and feature flags
   - Includes proper reset functionality on logout

2. A `PostHogPageView` component in `/src/providers/PostHogPageView.tsx` that:
   - Captures pageviews properly with Next.js app router
   - Uses Suspense to prevent client-side rendering of the entire app
   - Tracks URL changes correctly

### Configuration Options

Our PostHog initialization includes:

```typescript
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  capture_pageview: false, // Manual pageview capture 
  capture_pageleave: true, // Enable pageleave tracking
  persistence: 'localStorage',
  autocapture: true,
  session_recording: {
    maskAllInputs: false,
  },
})
```

### User Identification

We identify users when they log in with Clerk:

```typescript
if (isSignedIn && userId && user) {
  const userProperties = {
    email: user.emailAddresses[0]?.emailAddress,
    phone: user.phoneNumbers[0]?.phoneNumber,
    name: `${user.firstName} ${user.lastName}`.trim(),
    restaurantName: restaurant?.name,
  }

  // Filter out undefined values
  const cleanProperties = Object.fromEntries(
    Object.entries(userProperties).filter(([_, v]) => v !== undefined),
  )

  // Identify the user with Clerk userId
  posthog.identify(userId, cleanProperties)
}
```

### Resetting on Logout

We properly reset the user identification when they log out:

```typescript
export function resetPostHogUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset(true) // Reset with true parameter resets device_id too
  }
}
```

## Usage

### Capturing Events

```typescript
import { captureEvent } from '@/providers/PostHogProvider'

// In a component or function
captureEvent('button_clicked', { buttonId: 'submit' })
```

### Checking Feature Flags

```typescript
import { useFeatureFlag } from '@/providers/PostHogProvider'

// In a component
const isFeatureEnabled = useFeatureFlag('new-feature')

if (isFeatureEnabled) {
  // Show new feature
}
```

## References

- [PostHog Next.js Integration Guide](https://posthog.com/docs/libraries/next-js)
- [PostHog User Identification](https://posthog.com/docs/libraries/js#identifying-users)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags/manual-implementation)