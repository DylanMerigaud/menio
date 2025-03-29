import ThemeProvider from '@/providers/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import '@radix-ui/themes/styles.css'
import PostHogProvider from '@/providers/PostHogProvider'
import PostHogPageView from '@/providers/PostHogPageView'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ClerkProvider } from '@clerk/nextjs'
import { defaultLocale, locales, routing } from '@/i18n/routing'
import { TRPCReactProvider } from '@/trpc/react'
import { extractRouterConfig } from 'uploadthing/server'
import { ourFileRouter } from '@/app/api/uploadthing/core'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { HydrateClient } from '@/trpc/server'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { frFR, enUS } from '@clerk/localizations'
import AuthTracker from '@/providers/AuthTracker'
import { Suspense } from 'react'
import { FacebookPixelEvents } from '@/components/pixel-events'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export async function generateMetadata() {
  const locale = await getLocale()

  return {
    metadataBase: new URL(defaultUrl),
    title: {
      default: 'Menio - Restaurant Website Builder',
      template: '%s | Menio',
    },
    description:
      'Create a beautiful website for your restaurant instantly and improve your online visibility',
    keywords: [
      'restaurant website',
      'restaurant online presence',
      'restaurant builder',
      'restaurant template',
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      url: `${defaultUrl}`,
      title: 'Menio - Restaurant Website Builder',
      description:
        'Create a beautiful website for your restaurant instantly and improve your online visibility',
      siteName: 'Menio',
      locale: locale,
      images: [
        {
          url: `${defaultUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Menio - Restaurant Website Builder',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Menio - Restaurant Website Builder',
      description:
        'Create a beautiful website for your restaurant instantly and improve your online visibility',
      images: [`${defaultUrl}/twitter-image.png`],
    },
    icons: {
      icon: [
        { url: '/light-icon.svg', media: '(prefers-color-scheme: light)' },
        { url: '/dark-icon.svg', media: '(prefers-color-scheme: dark)' },
      ],
    },
    alternates: {
      canonical: `${defaultUrl}`,
      languages: {
        en: `${defaultUrl}/en`,
        fr: `${defaultUrl}/fr`,
      },
    },
  }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout(props: {
  children: React.ReactNode
}) {
  const { children } = props
  // if (!hasLocale(routing.locales, locale)) {
  //   notFound()
  // }
  const locale = await getLocale()

  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${defaultUrl}/${defaultLocale}`}
        />
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${defaultUrl}/${loc}`}
          />
        ))}
      </head>
      <body
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
        }}
      >
        <NextTopLoader
          showSpinner={false}
          height={2}
          color="hsl(var(--primary))"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <ClerkProvider localization={locale === 'fr' ? frFR : enUS}>
                <PostHogProvider>
                  <AuthTracker>
                    <Suspense fallback={null}>
                      <FacebookPixelEvents />
                    </Suspense>
                    <Suspense fallback={null}>
                      <PostHogPageView />
                    </Suspense>
                    <NextSSRPlugin
                      routerConfig={extractRouterConfig(ourFileRouter)}
                    />
                    <main className="flex min-h-screen w-full flex-col">
                      <HydrateClient>{children}</HydrateClient>
                      <Analytics />
                    </main>
                    <Toaster />
                    <ReactQueryDevtools initialIsOpen={false} />
                  </AuthTracker>
                </PostHogProvider>
              </ClerkProvider>
            </NextIntlClientProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
