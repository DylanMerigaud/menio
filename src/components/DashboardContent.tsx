'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { api } from '@/trpc/react'
import { useEffect } from 'react'
import { DashboardSkeleton } from './DashboardSkeleton'
import { SubscriptionCard } from './dashboard/SubscriptionCard'
import { SiteStatusCard } from './dashboard/SiteStatusCard'
import { SiteStatusCardSkeleton } from './dashboard/SiteStatusCardSkeleton'
import { ActionButtons } from './dashboard/ActionButtons'
import { ActionButtonsSkeleton } from './dashboard/ActionButtonsSkeleton'

type RestaurantData = {
  id: string
  name: string
  slug: string
  published: boolean
  owner: {
    id: string
    firstName: string
  }
}

export function DashboardContent() {
  const t = useTranslations()

  // Track dashboard view
  useEffect(() => {
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackDashboardView()
    })
  }, [])

  // Handle initialData if provided
  const { data: restaurantData, isLoading } =
    api.restaurants.getRestaurantWithOwner.useQuery()

  // locale is no longer needed here since formatting is done in the SubscriptionCard component

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // No longer need to fetch subscription data, that's handled by the SubscriptionCard component

  const restaurant = restaurantData
    ? {
        name: restaurantData.name,
        subdomain: restaurantData.slug,
        status: restaurantData.published ? 'published' : 'notPublished',
        owner: {
          firstName: restaurantData.owner?.firstName || 'User',
        },
      }
    : {
        name: 'Restaurant',
        subdomain: 'restaurant',
        status: 'notPublished',
        owner: {
          firstName: 'User',
        },
      }
  return (
    <div className="container mx-auto flex flex-col gap-14 lg:mx-auto lg:max-w-[64rem]">
      <div className="mx-auto mt-8 flex flex-col items-center space-y-2">
        <h1 className="text-3xl font-bold">
          {t('dashboard.welcome', { name: restaurant.owner.firstName })}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcomeSubtitle')}
        </p>
      </div>

      <div className="container mx-auto space-y-8 p-6">
        {/* Main cards section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Subscription status card */}
          <SubscriptionCard />

          {/* Site status card */}
          {isLoading ? (
            <SiteStatusCardSkeleton />
          ) : (
            <SiteStatusCard
              status={restaurant.status as 'published' | 'notPublished'}
              subdomain={restaurant.subdomain}
            />
          )}
        </div>

        {/* Action buttons */}
        {isLoading ? (
          <ActionButtonsSkeleton />
        ) : (
          <ActionButtons subdomain={restaurant.subdomain} />
        )}
      </div>
    </div>
  )
}
