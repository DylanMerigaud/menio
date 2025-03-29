import { redirect } from '@/i18n/routing'

export default async function OnboardingIndexPage(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const { locale } = params

  redirect({
    href: '/onboarding/personal-info',
    locale,
  })
}
