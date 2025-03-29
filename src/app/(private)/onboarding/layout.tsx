import { getTranslations } from 'next-intl/server'
import { getOnboardingState } from '@/services/onboarding'
import { invariant } from '@/utils/invariant'
import { currentUser } from '@clerk/nextjs/server'
import OnboardingLayoutClient from './OnboardingLayout'
import { api } from '@/trpc/server'
import { HydrateClient } from '@/trpc/server'

export default async function OnboardingLayout(props: {
  children: React.ReactNode
}) {
  const { children } = props

  const t = await getTranslations()

  // Get current user
  const user = await currentUser()

  invariant(user, 'User not found')

  // Get onboarding state
  let onboardingState = await getOnboardingState(user.id)

  // Initialize if not exists
  if (!onboardingState) {
    onboardingState = {
      userId: user.id,
      currentStep: 'personal-info',
      completed: false,
      personalInfoCompleted: false,
      restaurantInfoCompleted: false,
      menuPicturesCompleted: false,
      openingTimesCompleted: false,
      contactInfoCompleted: false,
    }
  }

  // Prefetch common data for onboarding steps
  void api.owners.getOnboardingState.prefetch({ userId: user.id })

  // Gather translations for client component
  const translations: Record<string, string> = {
    'onboarding.title': t('onboarding.title'),
    'dashboard.overview': t('dashboard.overview'),
    'onboarding.personalInfo.title': t('onboarding.personalInfo.title'),
    'onboarding.restaurantInfo.title': t('onboarding.restaurantInfo.title'),
    'onboarding.menuAndPictures.title': t('onboarding.menuAndPictures.title'),
    'onboarding.openingTimes.title': t('onboarding.openingTimes.title'),
    'onboarding.contactInfo.title': t('onboarding.contactInfo.title'),
  }

  // Pass only necessary parts of the onboarding state to the client component
  return (
    <HydrateClient>
      <OnboardingLayoutClient translations={translations}>
        {children}
      </OnboardingLayoutClient>
    </HydrateClient>
  )
}
