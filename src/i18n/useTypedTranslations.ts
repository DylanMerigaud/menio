import { useTranslations as useNextIntlTranslations } from 'next-intl'
import type { TranslationNamespace, TranslationKey } from '@/generated/i18n'

/**
 * A simple, non-strict translation function type that accepts any string keys
 * Used for backward compatibility with existing code
 */
export type TranslationFunction = (
  key: string,
  values?: Record<string, string | number>,
) => string

/**
 * A strict translation function type that only accepts valid keys from our translation files
 * Use this for new components where you want TypeScript to catch invalid keys
 */
export type StrictTranslationFunction = <K extends TranslationKey>(
  key: K,
  values?: Record<string, string | number>,
) => string

/**
 * Default translation hook for existing components
 * Does not enforce strict key validation to maintain backward compatibility
 */
export function useTranslations(namespace?: TranslationNamespace) {
  return useNextIntlTranslations(namespace) as (
    key: TranslationKey,
    values?: Record<string, string | number>,
  ) => string
}

/**
 * Strict translation hook for new components
 * Will show TypeScript errors if an invalid translation key is used
 * Use this for new components to ensure type safety for translation keys
 */
export function useStrictTranslations(
  namespace?: TranslationNamespace,
): StrictTranslationFunction {
  return useNextIntlTranslations(namespace) as StrictTranslationFunction
}

// Legacy export for backward compatibility with imported types
export { useTranslations as useTypedTranslations }
