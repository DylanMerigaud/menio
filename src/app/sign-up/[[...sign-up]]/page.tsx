'use client'

import { SignUp } from '@clerk/nextjs'
import { IS_NEW_USER_KEY } from '@/providers/PostHogEvents'
import React from 'react'

// Helper function to set a flag in localStorage when a new account is created
function beforeAccountCreation(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(IS_NEW_USER_KEY, 'true')
  }
  return Promise.resolve()
}

export default function Page() {
  // This effect ensures the handler is called
  React.useEffect(() => {
    void beforeAccountCreation()
  }, [])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
