'use client'

import { captureEvent } from './PostHogProvider'

// Constants
export const IS_NEW_USER_KEY = 'isNewUser'

// User Events
export const trackUserSignIn = () => {
  captureEvent('user_signed_in')
}

export const trackUserSignUp = () => {
  captureEvent('user_signed_up')
}

export const trackUserSignOut = () => {
  captureEvent('user_signed_out')
}

// Onboarding Events
export const trackOnboardingStepView = (step: string) => {
  captureEvent('onboarding_step_view', { step })
}

export const trackOnboardingStepComplete = (step: string, success: boolean) => {
  captureEvent('onboarding_step_complete', {
    step,
    success,
  })
}

export const trackSlugCheck = (slug: string, available: boolean) => {
  captureEvent('slug_check', {
    slug,
    available,
  })
}

export const trackAddressSelect = (
  address: string,
  hasCoordinates: boolean,
) => {
  captureEvent('address_select', {
    address,
    hasCoordinates,
  })
}

export const trackMenuUpload = (
  fileSize: number,
  fileType: string,
  success: boolean,
) => {
  captureEvent('menu_upload', {
    fileSize,
    fileType,
    success,
  })
}

export const trackImageUpload = (
  count: number,
  totalSize: number,
  success: boolean,
) => {
  captureEvent('image_upload', {
    count,
    totalSize,
    success,
  })
}

export const trackSocialLinkAdd = (networkType: string) => {
  captureEvent('social_link_add', {
    networkType,
  })
}

// Dashboard Events
export const trackDashboardView = () => {
  captureEvent('dashboard_view')
}

export const trackAssistanceView = () => {
  captureEvent('assistance_view')
}

export const trackRestaurantPreview = (slug: string) => {
  captureEvent('restaurant_preview', {
    slug,
  })
}

export const trackRestaurantPublish = (
  slug: string,
  success: boolean,
  error?: string,
) => {
  // Capture the event with detailed properties
  captureEvent('restaurant_publish', {
    slug,
    success,
    publishedAt: success ? new Date().toISOString() : undefined,
    ...(error && { error }),
  })

  // Update user properties if successful
  if (success) {
    void import('./PostHogProvider').then(({ updateUserProperties }) => {
      updateUserProperties({
        restaurantPublished: true,
        publishedAt: new Date().toISOString(),
      })
    })
  }
}

export const trackRestaurantUnpublish = (slug: string, success: boolean) => {
  // Capture the event with detailed properties
  captureEvent('restaurant_unpublish', {
    slug,
    success,
    unpublishedAt: success ? new Date().toISOString() : undefined,
  })

  // Update user properties if successful
  if (success) {
    void import('./PostHogProvider').then(({ updateUserProperties }) => {
      updateUserProperties({
        restaurantPublished: false,
        unpublishedAt: new Date().toISOString(),
      })
    })
  }
}

export const trackEditSiteClick = () => {
  captureEvent('edit_site_click')
}

export const trackContactUsClick = () => {
  captureEvent('contact_us_click')
}

// Subscription Events
export const trackSubscriptionInit = () => {
  captureEvent('subscription_init')
}

export const trackSubscriptionCheckoutStart = () => {
  captureEvent('subscription_checkout_start')
}

export const trackSubscriptionCheckoutComplete = (
  success: boolean,
  error?: string,
  plan?: string,
) => {
  // Capture the event with detailed properties
  captureEvent('subscription_checkout_complete', {
    success,
    plan,
    checkoutCompletedAt: success ? new Date().toISOString() : undefined,
    ...(error && { error }),
  })

  // Update user properties if successful
  if (success) {
    void import('./PostHogProvider').then(({ updateUserProperties }) => {
      updateUserProperties({
        subscriptionStatus: 'active',
        subscriptionPlan: plan || 'monthly',
        subscriptionStartedAt: new Date().toISOString(),
      })
    })
  }
}

export const trackSubscriptionManage = () => {
  captureEvent('subscription_manage')
}

// Restaurant Website Events
export const trackRestaurantWebsiteView = (slug: string) => {
  captureEvent('restaurant_website_view', {
    slug,
  })
}

export const trackMenuView = (slug: string) => {
  captureEvent('menu_view', {
    slug,
  })
}

export const trackImageGalleryView = (slug: string) => {
  captureEvent('image_gallery_view', {
    slug,
  })
}

export const trackSocialLinkClick = (networkType: string, slug: string) => {
  captureEvent('social_link_click', {
    networkType,
    slug,
  })
}
