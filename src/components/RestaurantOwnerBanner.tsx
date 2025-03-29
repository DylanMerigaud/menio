'use client'

import { useStrictTranslations } from '@/i18n/useTypedTranslations'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { ArrowLeft, Pencil } from 'lucide-react'
import { api } from '@/trpc/react'
import { cn } from '@/utils/tailwind'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface RestaurantOwnerBannerProps {
  restaurantId: string
  isPublished: boolean
}

export function RestaurantOwnerBanner({
  restaurantId,
  isPublished,
}: RestaurantOwnerBannerProps) {
  const t = useStrictTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [published, setPublished] = useState(isPublished)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

  // Get subscription status - will be used after schema migration
  // We'll use it in a simplified way for now
  const { data: subscriptionData } =
    api.subscriptions.getSubscriptionStatus.useQuery(undefined, {
      refetchOnWindowFocus: false,
    })

  // Define mutations at component level
  const checkoutMutation = api.subscriptions.createCheckoutSession.useMutation()
  // Portal mutation will be used later for subscription management
  const publishMutation = api.restaurants.publishRestaurant.useMutation({
    onSuccess: () => {
      startTransition(() => {
        router.refresh()
      })
    },
    onError: (error) => {
      // If there's a subscription error, show the dialog
      if (
        error.message ===
        'Cannot publish restaurant without an active subscription'
      ) {
        setShowSubscriptionDialog(true)
      }
      // Revert the toggle state
      setPublished((prev) => !prev)
    },
  })

  const handleTogglePublished = async () => {
    try {
      // Check for free trial period and not canceled
      if (
        !published &&
        subscriptionData &&
        (!subscriptionData.isInFreeTrial ||
          subscriptionData.status === 'CANCELED')
      ) {
        // Track attempt when subscription is required
        void import('@/providers/PostHogEvents').then((module) => {
          module.trackRestaurantPublish(
            restaurantId,
            false,
            'Subscription required',
          )
        })
        setShowSubscriptionDialog(true)
        return
      }

      // Update published state optimistically
      setPublished((prev) => !prev)

      // Track the publishing/unpublishing event
      const isPublishing = !published
      void import('@/providers/PostHogEvents').then((module) => {
        if (isPublishing) {
          module.trackRestaurantPublish(restaurantId, true)
        } else {
          module.trackRestaurantUnpublish(restaurantId, true)
        }
      })

      // Call tRPC mutation to update the restaurant
      publishMutation.mutate({
        restaurantId,
        published: !published,
      })
    } catch (error) {
      console.error('Error updating restaurant visibility:', error)
      // Track error
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackRestaurantPublish(restaurantId, false, String(error))
      })
      // Revert on error
      setPublished((prev) => !prev)
    }
  }

  // Handle subscribe action
  const handleSubscribe = async () => {
    try {
      // Track subscription checkout start
      void import('@/providers/PostHogEvents').then((module) => {
        module.trackSubscriptionCheckoutStart()
      })

      // Use the predefined mutation
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
    setShowSubscriptionDialog(false)
  }

  return (
    <>
      <div className="bg-background sticky top-0 z-50 w-full border-b py-2">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${published ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`}
            ></div>
            <p className="text-sm">{t('common.ownerPreviewMode')}</p>
          </div>

          <div className="flex items-center md:space-x-4">
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="published"
                className={cn(
                  'text-sm',
                  published
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {published ? t('common.published') : t('common.unpublished')}
              </Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={handleTogglePublished}
                disabled={isPending || publishMutation.isPending}
                className={
                  published
                    ? 'data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-400'
                    : 'data-[state=unchecked]:bg-amber-600 dark:data-[state=unchecked]:bg-amber-400'
                }
              />
            </div>

            <Button asChild variant="default" size="sm" className="gap-1">
              <Link href="/onboarding">
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href={`/dashboard`}>
                <ArrowLeft className="h-4 w-4" />
                {t('common.dashboard')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.subscription.required')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.subscription.requireDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">{t('dashboard.subscription.includes')}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t('dashboard.subscription.feature.website')}</li>
              <li>{t('dashboard.subscription.feature.support')}</li>
              <li>{t('dashboard.subscription.feature.updates')}</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubscriptionDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubscribe}>
              {t('dashboard.subscription.subscribe')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
