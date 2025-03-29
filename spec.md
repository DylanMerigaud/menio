# Tech

## Stack

Framework: Next.js (App router)

Typescript

Style: Tailwind.css

UI: Shadcn.UI/ RadixUI

Animations: Framer motion

Form: React Hook Form with Zod

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

- Website Prod url is [https://menio.app](https://menio.app/#pricing)
- Make clean and minimalist UI with animations.
- Use next-intl to have English and french translation of everything. Use `/fr` and `/en` prefix of all pages.
- All the Owner pages are behind a logged wall that redirect if not logged

## Login/Register

Allow owner to login/register with only their phone number using a magic link.

Use Clerk and Supabase.

## Onboarding Flow (`menio.app/fr/onboarding`)

### Across all Onboarding sections

Display a Stepper to let owner known in which step he is. Make each step clickable so owner can change previous filled informations without losing any information at any point (Store it in supabase).

Each section of the onboarding will have it’s on form. All sections must be submitted to consider a owner onboarded.

For each onboarding section, some fields might be required or have constraints, make sure they are valid before owner can go to the next step.

Apply the best practice in the industry to make a simple flows that converts.

An Owner who as already completed the Onboarding flow an come back to edit it at any time.

### 1. Personal informations

- Firstname
  - Required
  - String
  - max 100 characters
- Lastname
  - Required
  - String
  - max 100 characters
- Company Name
  - Optional
  - String
  - max 100 characters
- Email
  - Optional
  - email

### 2. Restaurant basic infos

Display a form where owner could fill these informations:

- restaurant’s name
  - required
  - max 100 characters
- Restaurant’s short description
  - required
  - max 400 characters
- Address
  - required

### 3. Menu & pictures

- menu (owner upload a pdf. Menu.pdf will be displayed on website with a button → open in a new tab)
  - optional
  - format: pdf
- Pictures (restaurant outside, inside, plates)
  - optional
  - format: images

### 4. Opening times

- Display a form where owner can describe it’s open time slots (start/end hours) for every day of the week.
- If he’s open/closed and at which time slot he’s open, allow for multiple time slot.
  - Required for everyday

### 5. Reservations and social medias

Reservations :

- phone number
  - optional
  - format: phone number
- reservation url
  - optional
  - format: url
- no reservations
  - this option disabled others (optional)
- Social medias : owner copy paste his social media links
  - optional
  - format: url
- Restaurant’s email
  - optional
  - format: email

### Submit

owner get’s redirected to it’s Site Preview

## Generated Site (`[restaurant_slug].menio.app/fr`)

### Nav with all section of the site preview: Direction, Opening times, Menu, Contact

### 1. Hero section

Recap of:

- Restaurant’s name
- Restaurant’s description
- Restaurant open/close state
  - If it’s open: until when (green)
  - if not: when it will be opened (red)
  - if close soon (30 min): orange
- Blurred restaurant image in background

### 2. Direction

- Google map preview of the address
- Display of text address
- Button to go to address

### 3. Opening times

Display of every day of the week times slots

### 4. Reservations and social medias

Links all social media owner have filed in onboarding form

## Site Preview (`menio.app/fr/preview`)

Same as Generated Site page, but with banner at top, displaying Site state (Publish, unpublished) and a button to go to backoffice

## Dashboard (`menio.app/fr/dashboard`)

### Side nav

All Dashboard pages will have the same side Side nav with:

- Overview
  - Redirect to Overview
- Edit my Restaurant’s Site
  - Go back to Onboarding Flow
- Assistance
  - Redirect to Assistance page
- CGU/CGV
  - Redirect to CGU/CGV page

### Overview

- Button: “See my website”
  - Open to a new tab
  - Link = `[restaurant_slug].menio.app`
- Website Status will be displayed :
  - published
  - not published
- Welcome message: “Welcome back {firstname}”
- Message: telling owner he have to subscribe in order to publish his website online
  - Displayed only IF the owner has not subscribed yet
  - Button:
    - redirect: Stripe payment popup
- Message: telling owner his site is published and he can share it + website link copy/paste button
  - Displayed only IF the owner has subscribed
  - Link = `[restaurant_slug].menio.app`
  - Button:
    - action: copy link to clipboard

### Assistance

- FAQ (support for the owner)
  - accordion
  - question+answer
- Button “contact us”
  - mailto:thomas@menio.app

### Settings

- Button: “Modify my informations”
  - Redirect: step 1 onboarding
  - Enable owner to modify informations and save with “Save” button
- Button “Manage my subscription”
  - Redirect: Stripe customer portal

### CGU/CGV

### Owner cases

- Owner want to edit his website
  1. Go to dashboard
  2. In the sidebar menu, Click on “edit my website”
  3. Redirect to onboarding
  4. Can edit informations and save
- Owner needs support
  1. Go to dashboard
  2. In the sidebar menu, Click on “Assistance”
  3. Access to FAQ + Can contact assistance with “Contact us” button
- Owner want to edit his informations
  1. Go to dashboard
  2. In the sidebar menu, Click on “Settings”
  3. Click on Button “modify my informations”
- Owner want to manage his subscription
  1. Go to dahsboard
  2. In the sidebar menu, Click on “Settings”
  3. Click on Button “Manage my subscription”
- Owner want to see his website as a visitor
  1. Go to dashboard
  2. Click Button “See my website”
