import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from './routing'
import { cookies, headers } from 'next/headers'
import acceptLanguage from 'accept-language'

// Initialize acceptLanguage with your supported locales
acceptLanguage.languages(['en', 'fr'])

export default getRequestConfig(async () => {
  // Determine the locale from cookies or Accept-Language header
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value

  let locale = defaultLocale

  if (localeCookie) {
    // If cookie exists, use it
    locale = localeCookie
  } else {
    // Otherwise check the Accept-Language header
    const headersList = await headers()
    const acceptLanguageHeader = headersList.get('Accept-Language')
    if (acceptLanguageHeader) {
      locale = acceptLanguage.get(acceptLanguageHeader) || defaultLocale
    }
  }

  // Load messages for the determined locale
  const messagesModule = (await import(`../messages/${locale}.json`)) as {
    default: Record<string, unknown>
  }

  return {
    locale,
    messages: messagesModule.default,
  }
})
