import { getTranslations } from 'next-intl/server'
import { api, HydrateClient } from '@/trpc/server'
import RestaurantInfoForm from './RestaurantInfoForm'
import OnboardingPageContent from '@/components/OnboardingPageContent'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({
    locale,
    namespace: 'onboarding.restaurantInfo',
  })

  return {
    title: `${t('title')} | Menio`,
  }
}

function RestaurantInfoContent() {
  return (
    <OnboardingPageContent
      titleKey="onboarding.restaurantInfo.title"
      defaultTitle="Restaurant Info"
      descriptionKey="onboarding.restaurantInfo.description"
      defaultDescription="Tell us about your restaurant. This information will appear on your website."
    >
      <RestaurantInfoForm />
    </OnboardingPageContent>
  )
}

export default async function RestaurantInfoPage() {
  // Fetch restaurant data
  await api.restaurants.findRestaurantWithOpeningHours.prefetch()

  return (
    <HydrateClient>
      <RestaurantInfoContent />
    </HydrateClient>
  )
}
