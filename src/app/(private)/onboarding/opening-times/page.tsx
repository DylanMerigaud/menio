import { api, HydrateClient } from '@/trpc/server'
import OpeningTimesForm from './OpeningTimesForm'
import OnboardingPageContent from '@/components/OnboardingPageContent'

function OpeningTimesContent() {
  return (
    <OnboardingPageContent
      titleKey="onboarding.openingTimes.title"
      defaultTitle="Opening Times"
      descriptionKey="onboarding.openingTimes.description"
      defaultDescription="Set your restaurant's opening hours for each day of the week."
    >
      <OpeningTimesForm />
    </OnboardingPageContent>
  )
}

export default async function OpeningTimesPage() {
  // Fetch restaurant data with opening hours
  await api.restaurants.getRestaurantWithOpeningHours.prefetch()

  return (
    <HydrateClient>
      <OpeningTimesContent />
    </HydrateClient>
  )
}
