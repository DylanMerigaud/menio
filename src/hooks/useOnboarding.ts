import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/trpc/react'

// Onboarding steps
export type OnboardingStep =
  | 'personal-info'
  | 'restaurant-info'
  | 'menu-pictures'
  | 'opening-times'
  | 'contact-info'
  | 'completed'

export type OnboardingState = {
  currentStep: OnboardingStep
  userId: string
  loading: boolean
  completed: boolean
  ownerId?: string
  restaurantId?: string
  personalInfoCompleted: boolean
  restaurantInfoCompleted: boolean
  menuPicturesCompleted: boolean
  openingTimesCompleted: boolean
  contactInfoCompleted: boolean
}

/**
 * Hook to get and manage onboarding state.
 * This derives the onboarding state from the existing data in the database.
 */
export function useOnboarding() {
  const { user } = useUser()
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'personal-info',
    userId: '',
    loading: true,
    completed: false,
    personalInfoCompleted: false,
    restaurantInfoCompleted: false,
    menuPicturesCompleted: false,
    openingTimesCompleted: false,
    contactInfoCompleted: false,
  })

  // Use tRPC to fetch onboarding state
  const { data: onboardingData, isLoading } =
    api.owners.getOnboardingState.useQuery(
      { userId: user?.id || '' },
      { enabled: !!user },
    )

  useEffect(() => {
    // Update state when data comes in from tRPC
    if (onboardingData && user) {
      setState({
        currentStep: onboardingData.currentStep,
        userId: user.id,
        loading: false,
        completed: onboardingData.completed,
        ownerId: onboardingData.ownerId,
        restaurantId: onboardingData.restaurantId,
        personalInfoCompleted: onboardingData.personalInfoCompleted,
        restaurantInfoCompleted: onboardingData.restaurantInfoCompleted,
        menuPicturesCompleted: onboardingData.menuPicturesCompleted,
        openingTimesCompleted: onboardingData.openingTimesCompleted,
        contactInfoCompleted: onboardingData.contactInfoCompleted,
      })
    }
  }, [onboardingData, user])

  // Set loading state based on query status
  useEffect(() => {
    if (user) {
      setState((prev) => ({ ...prev, loading: isLoading }))
    }
  }, [isLoading, user])

  /**
   * Helper to move to the next onboarding step
   */
  const moveToNextStep = async (): Promise<OnboardingStep> => {
    // Determine next step
    let nextStep: OnboardingStep

    switch (state.currentStep) {
      case 'personal-info':
        nextStep = 'restaurant-info'
        break
      case 'restaurant-info':
        nextStep = 'menu-pictures'
        break
      case 'menu-pictures':
        nextStep = 'opening-times'
        break
      case 'opening-times':
        nextStep = 'contact-info'
        break
      case 'contact-info':
        nextStep = 'completed'
        break
      default:
        nextStep = 'completed'
    }

    // Update state
    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
      completed: nextStep === 'completed',
    }))

    return nextStep
  }

  return {
    ...state,
    moveToNextStep,
  }
}
