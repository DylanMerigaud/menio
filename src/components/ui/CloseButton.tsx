'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import React from 'react'

export function CloseButtonText() {
  const t = useTranslations()
  return <>{t('common.close')}</>
}
