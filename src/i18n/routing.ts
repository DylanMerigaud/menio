import { defineRouting, type Pathnames } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import Link from 'next/link'
import { redirect as nextRedirect, type RedirectType } from 'next/navigation'

export const locales = ['en', 'fr'] as const
export const defaultLocale = 'en'

export type AppLocale = (typeof locales)[number]

// Define the pathnames for type-safe routing
export const pathnames = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/dashboard/admin': '/dashboard/admin',
  '/dashboard/assistance': '/dashboard/assistance',
  '/dashboard/terms': '/dashboard/terms',
  '/onboarding': '/onboarding',
  '/onboarding/personal-info': '/onboarding/personal-info',
  '/onboarding/restaurant-info': '/onboarding/restaurant-info',
  '/onboarding/menu-pictures': '/onboarding/menu-pictures',
  '/onboarding/opening-times': '/onboarding/opening-times',
  '/onboarding/contact-info': '/onboarding/contact-info',
  '/preview': '/preview',
  '/restaurant/[slug]': '/restaurant/[slug]',
} satisfies Pathnames<typeof locales>

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't use locale prefix in URLs
  localePrefix: 'never',

  // Add alternate links for SEO
  alternateLinks: true,
})

// Export the navigation functions to be used instead of Next.js ones
export const { usePathname, useRouter, permanentRedirect } = createNavigation({
  locales,
  pathnames,
  localePrefix: 'never',
})

const redirect = ({
  href,
  type,
}: {
  href: string
  type?: RedirectType
  locale: string
}) => nextRedirect(href, type)

export { Link, redirect }
