import { getTranslations } from 'next-intl/server'
import { api, HydrateClient } from '@/trpc/server'
import MenuAndPicturesForm from './MenuAndPicturesForm'
import OnboardingPageContent from '@/components/OnboardingPageContent'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  const t = await getTranslations({
    locale,
    namespace: 'onboarding.menuAndPictures',
  })

  return {
    title: `${t('title')} | Menio`,
  }
}

function MenuPicturesContent() {
  return (
    <OnboardingPageContent
      titleKey="onboarding.menuAndPictures.title"
      defaultTitle="Menu & Pictures"
      descriptionKey="onboarding.menuAndPictures.description"
      defaultDescription="Upload your restaurant menu and showcase your restaurant with beautiful photos."
    >
      <MenuAndPicturesForm />
    </OnboardingPageContent>
  )
}

export default async function MenuAndPicturesPage() {
  await api.restaurants.getRestaurantMedias.prefetch()

  return (
    <HydrateClient>
      <MenuPicturesContent />
    </HydrateClient>
  )
}
