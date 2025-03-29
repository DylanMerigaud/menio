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
- 💾 Supabase database and storage
- 💳 Subscription payments with Stripe
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🌍 Internationalization with next-intl
- 📊 Analytics integration

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

3. **Set up Supabase**

   Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
   
   Run the SQL from `schema.sql` in the Supabase SQL editor to set up the database schema.
   
   Create two storage buckets:
   - `menus` - for restaurant menu PDFs
   - `restaurant_images` - for restaurant photos
   
   Set both buckets to have public access.

4. **Set up Clerk (Authentication)**

   Create a new Clerk application at [https://clerk.dev](https://clerk.dev)

5. **Set up Stripe (Payments)**

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

6. **Set up environment variables**

   Copy the `.env.example` file to `.env.local` and fill in the required values:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[INSERT CLERK PUBLISHABLE KEY]
   CLERK_SECRET_KEY=[INSERT CLERK SECRET KEY]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[INSERT STRIPE PUBLISHABLE KEY]
   STRIPE_SECRET_KEY=[INSERT STRIPE SECRET KEY]
   STRIPE_WEBHOOK_SECRET=[INSERT STRIPE WEBHOOK SECRET FROM CLI]
   STRIPE_PRICE_ID=[INSERT STRIPE PRICE ID FOR 30 EUR/MONTH SUBSCRIPTION]
   ```

7. **Run the development server**

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

Each step saves data to Supabase and tracks progress in the `onboarding_state` table.

### Database Schema

The database schema includes the following tables:

- `owners` - Restaurant owners information
- `restaurants` - Restaurant details
- `opening_hours` - Restaurant opening hours for each day
- `contact_info` - Contact information and social media links
- `restaurant_images` - Restaurant photos
- `onboarding_state` - Track onboarding progress

See `schema.sql` for the complete database schema.

### Authentication

Authentication is handled by Clerk. Users can register, log in, and reset passwords.

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

The application supports multiple languages using next-intl:

- English (default)
- French

Language files are located in `src/messages/`.

### Scripts

- `pnpm dev` — Starts the application in development mode at `http://localhost:3000`.
- `pnpm build` — Creates an optimized production build of your application.
- `pnpm start` — Starts the application in production mode.
- `pnpm type-check` — Validate code using TypeScript compiler.
- `pnpm lint` — Runs ESLint for all files in the `src` directory.
- `pnpm format` — Runs Prettier and formats files.
- `pnpm test` — Runs all the jest tests in the project.

### Requirements

- Node.js >= 18.17.0
- pnpm 8

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more information.
