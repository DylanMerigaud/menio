'use client'

import { type ReactNode, useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as OriginalPostHogProvider } from 'posthog-js/react'
import { useAuth, useUser } from '@clerk/nextjs'
import { api } from '@/trpc/react'

// Initialize PostHog (only in browser and if env var is set)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // Disable automatic pageview capture
    capture_pageleave: true, // Enable pageleave capture
    persistence: 'localStorage',
    autocapture: true,
    session_recording: {
      maskAllInputs: false,
    },
  })
}

interface PostHogProviderProps {
  children: ReactNode
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  // Fetch owner data if user is signed in
  const { data: owner } = api.owners.findOwner.useQuery(undefined, {
    enabled: !!isSignedIn,
  })

  // Fetch restaurant data if user is signed in
  const { data: restaurant } = api.restaurants.getRestaurant.useQuery(
    undefined,
    { enabled: !!isSignedIn },
  )

  useEffect(() => {
    // Only run in browser and if PostHog is initialized
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return
    }
    // Identify user if signed in
    if (isSignedIn && userId && owner) {
      const userProperties = {
        email: owner.email || user?.emailAddresses[0]?.emailAddress,
        phone: user?.phoneNumbers[0]?.phoneNumber,
        name: `${owner.firstName} ${owner.lastName}`.trim() || user?.fullName,
        companyName: owner.companyName,
        restaurantName: restaurant?.name,
        // Enhanced properties
        restaurantPublished: !!restaurant?.published,
        restaurantSlug: restaurant?.slug,
      }

      // Filter out undefined values
      const cleanProperties = Object.fromEntries(
        Object.entries(userProperties).filter(([_, v]) => v !== undefined),
      )

      // Identify the user with Clerk userId and all available properties
      posthog.identify(userId, cleanProperties)

      // Register super properties that should be included with all events
      posthog.register({
        restaurantId: restaurant?.id,
        restaurantSlug: restaurant?.slug,
        ownerId: owner.id,
      })
    }
    if (!isSignedIn) {
      resetPostHogUser()
    }
  }, [isSignedIn, userId, owner, restaurant])

  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <OriginalPostHogProvider client={posthog}>
      {children}
    </OriginalPostHogProvider>
  )
}

// Usage utilities for PostHog
export function captureEvent(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties)
  }
}

// Update user properties without re-identifying
export function updateUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.people.set(properties)
  }
}

export function useFeatureFlag(flagKey: string): boolean {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return posthog.isFeatureEnabled(flagKey) || false
  }
  return false
}

// Reset PostHog identification when user logs out
export function resetPostHogUser() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset(true) // Reset with true parameter resets device_id too
  }
}
