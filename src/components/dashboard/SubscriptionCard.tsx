'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { useLocale } from 'next-intl'
import { api } from '@/trpc/react'
import { SubscriptionCardSkeleton } from './SubscriptionCardSkeleton'

export function SubscriptionCard() {
  const t = useTranslations()
  const locale = useLocale()

  const { data: subscriptionData, isLoading: isSubscriptionLoading } =
    api.subscriptions.getSubscriptionStatus.useQuery()

  const formattedTrialEndDate =
    subscriptionData?.trialEndDate?.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  // Define mutations at component level to avoid hooks in event handlers
  const checkoutMutation = api.subscriptions.createCheckoutSession.useMutation()
  const portalMutation = api.subscriptions.createPortalSession.useMutation()

  // Handle subscription button click
  const handleSubscribe = async () => {
    try {
      // Track subscription checkout start
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackSubscriptionCheckoutStart()
      })

      const result = await checkoutMutation.mutateAsync()
      if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      // Track checkout error
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackSubscriptionCheckoutComplete(false, String(error))
      })
      console.error('Failed to create checkout session:', error)
    }
  }

  // Handle manage subscription button click
  const handleManageSubscription = async () => {
    try {
      // Track subscription management
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackSubscriptionManage()
      })

      const result = await portalMutation.mutateAsync()
      if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Failed to create portal session:', error)
    }
  }

  // Show loading skeleton while data is being fetched
  if (isSubscriptionLoading || !subscriptionData) {
    return <SubscriptionCardSkeleton />
  }

  // Check if the subscription was previously active but is now inactive
  const hasExpiredSubscription =
    subscriptionData &&
    !subscriptionData.hasActiveSubscription &&
    !subscriptionData.isInFreeTrial &&
    subscriptionData.status === 'CANCELED'

  console.log(subscriptionData, hasExpiredSubscription)

  if (subscriptionData.isInFreeTrial && formattedTrialEndDate) {
    // Free trial ongoing
    return (
      <Card className="gap-2 overflow-hidden border-0 bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold">
            {t('dashboard.subscription.freeTrialActive')}
          </h2>
        </CardHeader>
        <CardContent className="space-y-1 text-center">
          <p>
            {t('dashboard.subscription.freeTrialMessage', {
              date: formattedTrialEndDate,
            })}
          </p>
          <div className="pt-6 pb-2">
            <Button
              variant="outline"
              size="xl"
              onClick={handleManageSubscription}
            >
              {t('dashboard.subscription.manage')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (subscriptionData.hasActiveSubscription) {
    // Active subscription
    return (
      <Card className="text-primary-foreground gap-2 overflow-hidden border-0 bg-emerald-600 dark:bg-emerald-700">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold">
            {t('dashboard.subscription.active')}
          </h2>
        </CardHeader>
        <CardContent className="space-y-1 text-center">
          {subscriptionData.stripeSubscription?.currentPeriodEnd ? (
            <p>
              {t('dashboard.subscription.activeDetails', {
                date: subscriptionData.stripeSubscription.currentPeriodEnd.toLocaleDateString(
                  locale,
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                ),
              })}
            </p>
          ) : (
            <p>{t('dashboard.subscription.activeDetailsNoDate')}</p>
          )}
          <p>{t('dashboard.subscription.includes')}</p>

          <div className="pt-6 pb-2">
            <Button
              variant="outline"
              className="bg-white text-emerald-600 hover:bg-white/90 dark:bg-gray-200 dark:hover:bg-gray-300"
              size="xl"
              onClick={handleManageSubscription}
            >
              {t('dashboard.subscription.manage')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <div className="flex w-full items-center justify-center gap-2">
            <span>{t('dashboard.subscription.feature.website')}</span>
            <span
              className="bg-primary-foreground dark:bg-primary-foreground h-1 w-1 rounded-full"
              aria-hidden="true"
            ></span>
            <span>{t('dashboard.subscription.feature.support')}</span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Check if it's an expired subscription
  if (hasExpiredSubscription) {
    return (
      <Card className="text-primary-foreground gap-2 overflow-hidden border-0 bg-amber-600 dark:bg-amber-700">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold">
            {t('dashboard.subscription.expired')}
          </h2>
        </CardHeader>
        <CardContent className="space-y-1 text-center">
          <p>{t('dashboard.subscription.expiredDetails')}</p>

          <div className="pt-6 pb-2">
            <Button
              variant="outline"
              className="bg-white text-amber-600 hover:bg-white/90 dark:bg-gray-200 dark:hover:bg-gray-300"
              size="xl"
              onClick={handleSubscribe}
            >
              {t('dashboard.subscription.subscribe')}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="mt-auto text-center text-sm">
          <p className="w-full">{t('dashboard.subscription.expiredPrice')}</p>
        </CardFooter>
      </Card>
    )
  }

  // No subscription (new user)
  return (
    <Card className="text-primary-foreground bg-primary gap-2 overflow-hidden border-0">
      <CardHeader>
        <h2 className="text-center text-2xl font-bold">
          {t('dashboard.subscription.freeTrial.title')}
        </h2>
      </CardHeader>
      <CardContent className="space-y-1 text-center">
        <p>{t('dashboard.subscription.freeTrial.description')}</p>
        <p>{t('dashboard.subscription.freeTrial.noCommitment')}</p>

        <div className="pt-6 pb-2">
          <Button
            variant="outline"
            className="text-primary hover:text-primary bg-white hover:bg-white/90 dark:bg-gray-200 dark:hover:bg-gray-300"
            size="xl"
            onClick={handleSubscribe}
          >
            {t('dashboard.subscription.subscribeAndPublish')}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="mt-auto text-center text-sm">
        <p className="w-full">
          {t('dashboard.subscription.freeTrial.pricingInfo')}
        </p>
      </CardFooter>
    </Card>
  )
}
