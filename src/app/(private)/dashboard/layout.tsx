import { getOnboardingState } from '@/services/onboarding'
import { redirect } from '@/i18n/routing'
import { auth } from '@clerk/nextjs/server'
import DashboardClient from './DashboardClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side check for onboarding state
  const session = await auth()
  if (!session.userId) {
    throw new Error('User not found')
  }

  const onboardingState = await getOnboardingState(session.userId)

  if (!onboardingState?.completed) {
    redirect({ href: '/onboarding', locale: 'en' })
  }

  return <DashboardClient>{children}</DashboardClient>
}
