import { DashboardContent } from '@/components/DashboardContent'
import { HydrateClient } from '@/trpc/server'
import { api } from '@/trpc/server'

export default async function DashboardPage() {
  await api.restaurants.getRestaurantWithOwner.prefetch()
  await api.subscriptions.getSubscriptionStatus.prefetch()

  return (
    <HydrateClient>
      <DashboardContent />
    </HydrateClient>
  )
}
