'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState, type ReactNode } from 'react'
import {
  trackUserSignIn,
  trackUserSignUp,
  IS_NEW_USER_KEY,
} from './PostHogEvents'

interface AuthTrackerProps {
  children: ReactNode
}

export default function AuthTracker({ children }: AuthTrackerProps) {
  const { isSignedIn } = useAuth()
  const [prevSignedIn, setPrevSignedIn] = useState<boolean | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Skip the first render to avoid false positives
    if (isInitialLoad) {
      setPrevSignedIn(isSignedIn ?? null)
      setIsInitialLoad(false)
      return
    }

    // If user wasn't signed in before but is now, they've just signed in/up
    if (!prevSignedIn && isSignedIn) {
      // Check local storage for a flag that indicates this is a sign-up
      const isSignUp = localStorage.getItem(IS_NEW_USER_KEY)

      if (isSignUp === 'true') {
        trackUserSignUp()
        // Remove the flag after use
        localStorage.removeItem(IS_NEW_USER_KEY)
      } else {
        trackUserSignIn()
      }
    }

    setPrevSignedIn(isSignedIn ?? null)
  }, [isSignedIn, prevSignedIn, isInitialLoad])

  return <>{children}</>
}
