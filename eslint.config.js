import { FlatCompat } from '@eslint/eslintrc'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default tseslint.config(
  {
    ignores: ['.next', 't3-stack', 'src/generated'],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  // Add i18n import rules
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      // Avoid hardcoded labels in component markup
      'react/jsx-no-literals': [
        'warn',
        {
          // Allow literals in props which are often needed for aria- attributes and spacing
          allowedStrings: ['*'],
          // but enforce all content literals to be translated
          noStrings: true,
          ignoreProps: true,
        },
      ],

      // Enforce type-safe translations
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next-intl',
              importNames: ['useTranslations'],
              message:
                'Use import { useTranslations } from "@/i18n/useTypedTranslations" instead for type-safe translations.',
            },
            {
              name: 'next/link',
              message: 'Please import from `@/i18n/routing` instead.',
            },
            {
              name: 'next/navigation',
              importNames: [
                'redirect',
                'permanentRedirect',
                'useRouter',
                'usePathname',
              ],
              message: 'Please import from `@/i18n/routing` instead.',
            },
          ],
        },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
)
