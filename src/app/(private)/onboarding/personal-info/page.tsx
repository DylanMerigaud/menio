import { getTranslations } from 'next-intl/server'
import { api, HydrateClient } from '@/trpc/server'
import PersonalInfoForm from './PersonalInfoForm'
import OnboardingPageContent from '@/components/OnboardingPageContent'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({
    locale,
    namespace: 'onboarding.personalInfo',
  })

  return {
    title: `${t('title')} | Menio`,
  }
}

function PersonalInfoContent() {
  return (
    <OnboardingPageContent
      titleKey="onboarding.personalInfo.title"
      defaultTitle="Personal Info"
      descriptionKey="onboarding.personalInfo.description"
      defaultDescription="Tell us about yourself. This information will not be visible to customers."
    >
      <PersonalInfoForm />
    </OnboardingPageContent>
  )
}

export default async function PersonalInfoPage() {
  // Prefetch owner data
  await api.owners.findOwner.prefetch()

  return (
    <HydrateClient>
      <PersonalInfoContent />
    </HydrateClient>
  )
}
