'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/i18n/useTypedTranslations'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-semibold">{t('error.title')}</h2>
      <p className="text-muted-foreground max-w-md">{t('error.description')}</p>
      <Button onClick={reset}>{t('error.tryAgain')}</Button>
    </div>
  )
}
