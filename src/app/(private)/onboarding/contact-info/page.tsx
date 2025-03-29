import { getTranslations } from 'next-intl/server'
import { api, HydrateClient } from '@/trpc/server'
import ContactInfoForm from './ContactInfoForm'
import OnboardingPageContent from '@/components/OnboardingPageContent'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({
    locale,
    namespace: 'onboarding.contactInfo',
  })

  return {
    title: `${t('title')} | Menio`,
  }
}

function ContactInfoContent() {
  return (
    <OnboardingPageContent
      titleKey="onboarding.contactInfo.title"
      defaultTitle="Contact Info"
      descriptionKey="onboarding.contactInfo.description"
      defaultDescription="Set your restaurant's reservation options and social media links."
    >
      <ContactInfoForm />
    </OnboardingPageContent>
  )
}

export default async function ContactInfoPage() {
  // Fetch restaurant data
  await api.restaurants.getRestaurantWithOpeningHours.prefetch()

  return (
    <HydrateClient>
      <ContactInfoContent />
    </HydrateClient>
  )
}
