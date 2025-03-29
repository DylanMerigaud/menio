'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function NotFound() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">{t('common.notFoundCode')}</h1>
      <h2 className="mt-4 text-2xl font-semibold">{t('notFound.title')}</h2>
      <p className="text-muted-foreground mt-2">{t('notFound.description')}</p>
      <Button asChild className="mt-8">
        <Link href="/">
          <HomeIcon className="mr-2 h-4 w-4" />
          {t('notFound.goHome')}
        </Link>
      </Button>
    </div>
  )
}
