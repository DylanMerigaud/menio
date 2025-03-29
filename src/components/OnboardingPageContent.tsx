'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import type { TranslationKey } from '@/generated/i18n'

type OnboardingPageContentProps = {
  titleKey: TranslationKey
  defaultTitle: string
  descriptionKey: TranslationKey
  defaultDescription: string
  children: React.ReactNode
}

export default function OnboardingPageContent({
  titleKey,
  defaultTitle,
  descriptionKey,
  defaultDescription,
  children,
}: OnboardingPageContentProps) {
  const t = useTranslations()

  return (
    <div className="relative mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">
        {t(titleKey, { default: defaultTitle })}
      </h1>
      <p className="text-muted-foreground mb-12">
        {t(descriptionKey, { default: defaultDescription })}
      </p>
      {children}
    </div>
  )
}
