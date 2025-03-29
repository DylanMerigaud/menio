<h1 align="center">🍽️ Menio - Instant Restaurant Websites</h1>

<p align="center">
  Create a professional restaurant website in minutes
</p>

<div align="center">
  <img alt="GitHub License" src="https://img.shields.io/github/license/michaeltroya/supa-next-starter">
</div>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#setup-and-run-locally"><strong>Setup and run locally</strong></a> ·
  <a href="#documentation"><strong>Documentation</strong></a>
</p>
<br/>

## Features

**For Restaurant Owners:**

- 🍽️ Create a professional restaurant website in minutes
- 🔄 Simple onboarding process to collect restaurant information
- 📱 Mobile-optimized responsive design
- 🌐 Multilingual support (English, French)
- 🗓️ Opening hours with real-time open/closed status
- 📍 Location with Google Maps integration
- 📄 Menu display as PDF
- 📸 Photo gallery showcasing your restaurant
- 🔗 Reservation links integration
- 📲 Social media integration

**Technical Features:**

- ⚡️ Next.js 14 with App Router
- 🔐 Authentication with Clerk
- 🛢️ Prisma ORM with Neon PostgreSQL
- 📁 File uploads with UploadThing
- 💳 Subscription payments with Stripe
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🌍 Internationalization with next-intl
- 📊 Analytics integration with PostHog
- 🔄 Type-safe API with tRPC

## Setup and Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/menio.git
   cd menio
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up Neon PostgreSQL**

   Create a new Neon project at [https://neon.tech](https://neon.tech)

   Get your PostgreSQL connection string and add it to your `.env.local`:

   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

   Initialize your database with Prisma:

   ```bash
   pnpm prisma:push
   ```

4. **Set up UploadThing**

   Create an account at [https://uploadthing.com](https://uploadthing.com)

   Create a new app and get your API keys

   Add them to your `.env.local`:

   ```
   UPLOADTHING_SECRET=your-uploadthing-secret
   UPLOADTHING_APP_ID=your-uploadthing-app-id
   ```

5. **Set up Clerk (Authentication)**

   Create a new Clerk application at [https://clerk.dev](https://clerk.dev)

   Get your API keys and add them to your `.env.local`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   ```

6. **Set up Stripe (Payments)**

   Create a Stripe account at [https://stripe.com](https://stripe.com)

   Create a subscription product with price of 30 EUR/month

   Set up the Stripe CLI for webhook testing:

   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to your Stripe account
   stripe login

   # Forward webhooks to your local server
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

7. **Set up environment variables**

   Copy the `.env.example` file to `.env.local` and fill in the required values:

   ```
   DATABASE_URL=[INSERT NEON POSTGRESQL URL]
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[INSERT CLERK PUBLISHABLE KEY]
   CLERK_SECRET_KEY=[INSERT CLERK SECRET KEY]
   UPLOADTHING_SECRET=[INSERT UPLOADTHING SECRET]
   UPLOADTHING_APP_ID=[INSERT UPLOADTHING APP ID]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[INSERT STRIPE PUBLISHABLE KEY]
   STRIPE_SECRET_KEY=[INSERT STRIPE SECRET KEY]
   STRIPE_WEBHOOK_SECRET=[INSERT STRIPE WEBHOOK SECRET FROM CLI]
   STRIPE_PRICE_ID=[INSERT STRIPE PRICE ID FOR 30 EUR/MONTH SUBSCRIPTION]
   ```

8. **Run the development server**

   ```bash
   pnpm dev
   ```

   The application should now be running on [localhost:3000](http://localhost:3000/).

## Documentation

### Project Structure

```
menio/
├── public/             # Static files
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── [locale]/   # Internationalized routes
│   │   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── onboarding/         # Onboarding flow pages
│   │   │   ├── login/              # Authentication pages
│   │   │   └── register/
│   ├── components/     # Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── messages/       # Internationalization message files
│   ├── services/       # Supabase service functions
│   └── utils/          # Utility functions
└── schema.sql          # Supabase database schema
```

### Onboarding Flow

The onboarding process consists of 5 steps:

1. **Personal Information** - Collect owner's name and contact information
2. **Restaurant Information** - Collect restaurant name, description, and address
3. **Menu & Pictures** - Upload menu PDF and restaurant photos
4. **Opening Times** - Set restaurant opening hours for each day of the week
5. **Reservations & Social Media** - Add reservation links and social media accounts

Each step saves data to Supabase. The onboarding state is derived from the presence of records in each table.

#### Determining Onboarding Progress

The onboarding state is now dynamically derived from the data:

- **Personal Info**: Completed when an `owners` record exists for the user
- **Restaurant Info**: Completed when a `restaurants` record exists linked to the owner
- **Menu & Pictures**: Completed when `restaurant_images` records exist for the restaurant
- **Opening Times**: Completed when `opening_hours` records exist for the restaurant
- **Contact Info**: Completed when a `contact_info` record exists for the restaurant

Use the `useOnboarding` hook in client components or `getOnboardingState` service in server components to access the derived onboarding state.

### Database Schema

The database schema is defined using Prisma and includes the following models:

- `Owner` - Restaurant owners information
- `Restaurant` - Restaurant details
- `OpeningHours` - Restaurant opening hours for each day
- `ContactInfo` - Contact information and social media links
- `RestaurantImage` - Restaurant photos
- `RestaurantSocialLink` - Social media links for restaurants

See `prisma/schema.prisma` for the complete database schema.

### Authentication

Authentication is handled by Clerk. Users can register, log in, and reset passwords.

### File Storage

File uploads are handled by UploadThing:

- Restaurant logos
- Restaurant cover images
- Restaurant gallery photos
- Menu PDFs

See [UploadThing documentation](https://docs.uploadthing.com/) for more details.

### Payments & Subscriptions

Subscription payments are handled by Stripe:

- **Pricing:** 30 EUR/month with 1 free month trial
- **Trial Period:** New users automatically get a 30-day free trial
- **Subscription Management:** Users can manage their subscription through Stripe Customer Portal
- **Webhooks:** Stripe webhooks handle subscription lifecycle events:
  - `customer.subscription.created` - When a user subscribes
  - `customer.subscription.updated` - When subscription details change
  - `customer.subscription.deleted` - When a user cancels
  - `invoice.paid` - When a subscription payment succeeds
  - `invoice.payment_failed` - When a subscription payment fails

### Internationalization

The application supports multiple languages using next-intl with type-safe translations:

- English (default)
- French

Language files are located in `src/messages/`.

#### Type-Safe Translations

```tsx
// Import the typed translations
import { useTranslations } from '@/i18n/useTypedTranslations'

export function MyComponent() {
  // Fully typed translation function
  const t = useTranslations()

  // Access translations with type checking and auto-complete
  return <h1>{t('common.welcome')}</h1>
}
```

#### ESLint Rules

ESLint rules are configured to enforce i18n best practices:

- No hardcoded strings in JSX (use translations instead)
- Using `@/i18n/routing` for navigation APIs instead of Next.js modules
- Using `@/i18n/useTypedTranslations` for type-safe translations

#### Translation Validation

To validate that all translations exist in both language files:

```bash
pnpm validate:translations
```

This script ensures translation consistency and generates TypeScript types.

#### i18n Scripts

- `pnpm validate:translations` - Check for missing translation keys
- `pnpm validate:i18n` - Run translation validation and ESLint
- `pnpm lint:i18n-fix` - Fix ESLint i18n issues where possible

### Scripts

- `pnpm dev` — Starts the application in development mode at `http://localhost:3000`.
- `pnpm build` — Creates an optimized production build of your application.
- `pnpm start` — Starts the application in production mode.
- `pnpm type-check` — Validate code using TypeScript compiler.
- `pnpm lint` — Runs ESLint for all files in the `src` directory.
- `pnpm lint:i18n-fix` — Fixes ESLint i18n issues where possible.
- `pnpm format` — Runs Prettier and formats files.
- `pnpm test` — Runs all the jest tests in the project.
- `pnpm validate:translations` — Validates i18n translation files and generates types.
- `pnpm validate:i18n` — Validates i18n files and runs ESLint.
- `pnpm prisma:generate` — Generates Prisma client based on schema.
- `pnpm prisma:push` — Pushes schema changes to the database.
- `pnpm prisma:studio` — Opens Prisma Studio to view and edit data.
- `pnpm prisma:migrate:dev` — Creates new migrations based on schema changes (development).

See [Migrating from Supabase to Prisma](docs/supabase-to-prisma-migration.md) for detailed migration instructions.

### Requirements

- Node.js >= 18.17.0
- pnpm 8

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more information.
