'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { Pencil } from 'lucide-react'

type SiteStatusCardProps = {
  status: 'published' | 'notPublished'
  subdomain: string
}

export function SiteStatusCard({ status, subdomain }: SiteStatusCardProps) {
  const t = useTranslations()

  const handlePreviewClick = () => {
    // Track restaurant preview event
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackRestaurantPreview(subdomain)
    })
  }

  return (
    <Card className="gap-2 border-0 bg-gray-50 dark:bg-gray-900">
      <CardHeader className="flex flex-col items-center pt-2 pb-2">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`h-3 w-3 animate-pulse rounded-full ${status === 'published' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-warning'}`}
          ></div>
          <div
            className={`text-sm font-medium uppercase ${status === 'published' ? 'text-emerald-500 dark:text-emerald-400' : 'text-warning'}`}
          >
            {status === 'published'
              ? t('dashboard.status.published')
              : t('dashboard.status.notPublished')}
          </div>
        </div>
        <Button variant="link" className="text-lg" asChild>
          <a
            href={`https://${subdomain}${t('common.domainSuffix')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {subdomain}
            {t('common.domainSuffix')}
          </a>
        </Button>
      </CardHeader>
      <CardContent className="pt-4 text-center">
        <Button variant="default" size="xl" asChild>
          <Link href={`/restaurant/${subdomain}`} onClick={handlePreviewClick}>
            {t('dashboard.actions.viewSite')}
          </Link>
        </Button>
      </CardContent>
      <CardFooter className="justify-center pt-6 text-sm">
        <p className="text-center text-gray-500 dark:text-gray-400">
          {status === 'published'
            ? t('dashboard.subscription.activeDetailsNoDate')
            : t('dashboard.status.readyToPublish')}
        </p>
      </CardFooter>
    </Card>
  )
}
