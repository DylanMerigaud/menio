'use client'

import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { captureEvent } from '@/providers/PostHogProvider'

const localeIcons = {
  en: '🇬🇧',
  fr: '🇫🇷',
}

export default function LocaleSwitcher() {
  // We only need the current locale

  const currentLocale = useLocale()

  const handleLocaleChange = (newLocale: string) => {
    captureEvent('locale_changed', {
      from: currentLocale,
      to: newLocale,
    })

    // Set cookie with new locale
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`

    // Reload the page to apply the new locale
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => {
          const localeName = locale === 'fr' ? 'Français' : 'English'
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={locale === currentLocale ? 'bg-muted' : ''}
            >
              <span className="mr-2 text-lg">{localeIcons[locale]}</span>
              {localeName}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
