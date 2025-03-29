# CLAUDE.md - Guidelines for menio codebase

## Build/Lint/Test Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run all Jest tests
- `pnpm test -- -t "test name"` - Run specific test by name
- `pnpm test -- path/to/file.test.tsx` - Run tests in specific file
- `pnpm validate:translations` - Validate i18n translation files
- `pnpm validate:i18n` - Validate i18n files and run ESLint

## Code Style

- **Formatting**: Use Prettier with semi:false, singleQuote:true, printWidth:80
- **Imports**: Use absolute imports with @/ prefix (e.g., `import Component from '@/components/Component'`)
- **Component Structure**: React functional components with explicit typing
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Testing**: Use React Testing Library with Jest
- **State Management**: React Query for server state, React state for UI
- **Loading States**:
  - Do not fake data for loading states
  - Instead, use skeleton components for loading states
  - Display dates in the user's local format using toLocaleDateString(undefined, options)
- **Internationalization**:
  - Use next-intl with JSON message files
  - Never use hardcoded string literals in JSX (use translations instead)
  - Always import navigation APIs from `@/i18n/routing` instead of Next.js modules
  - Use the typed translations: `import { useTranslations } from '@/i18n/useTypedTranslations'`
- **UI Components**: shadcn/ui with Tailwind CSS
- **TypeScript**:
  - Avoid using any type, use type inference when possible
  - Never update database.types.ts file manually, let supabase generate it
- **Database**:
  - For now you can update migrations, it's not online yet

# Tech

## Stack

Framework: Next.js (App router)

Typescript

Style: Tailwind.css

UI: Shadcn.UI/ RadixUI

Animations: Framer motion

Form: React Hook Form with direct validation rules

DB: Supabase Postgres

File storage: Supabase

Auth: Clerk (SMS login)

AutoComplete Address: @react-google-maps/api

i18n: next-intl

Icons: lucide

Payments: Stripe

Features Management: Post Hog

## Guide Rules

Database

- Use foreign key, indexes, and constraints when needed

Stripe

- Use a maximum of stripe built in tools, avoid creating useless code our code base

PostHog

- Add a lot of Product analysis feedback on each user actions

# Product

## Description

SASS to create a website for your restaurant instantly.

Have the online visibility your restaurant deserve in few steps to gain new customers and improve your branding.

## Pricing

30 euros per month once site is published.

Owner must save credit card with Stripe in order to have the free month. Handle the free month logic in stripe on signup.

1 Free month on signup.

## Lexic

Visitor: Person who is looking for a restaurant

Owner: Person who has signed up and who can edit it’s restaurant Page

## Across the app

- Website Prod url is <https://menio.app>
- Make clean and minimalist UI with animations.
- Use next-intl to have English and french translation of everything. Use `/fr` and `/en` prefix of all pages.
- All the Owner pages are behind a logged wall that redirect if not logged
