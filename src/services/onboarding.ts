import { db } from '@/server/db'

export type OnboardingStep =
  | 'personal-info'
  | 'restaurant-info'
  | 'menu-pictures'
  | 'opening-times'
  | 'contact-info'
  | 'completed'

export type OnboardingData = {
  currentStep: OnboardingStep
  ownerId?: string
  restaurantId?: string
  userId: string
  completed: boolean
  personalInfoCompleted: boolean
  restaurantInfoCompleted: boolean
  menuPicturesCompleted: boolean
  openingTimesCompleted: boolean
  contactInfoCompleted: boolean
}

/**
 * Server-side function to derive onboarding state from existing data
 */
export async function getOnboardingState(
  userId: string,
): Promise<OnboardingData | null> {
  if (!userId) return null

  // Check for owner record (personal info)
  const owner = await db.owner.findFirst({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  })

  const personalInfoCompleted = !!owner

  let restaurantInfoCompleted = false
  let restaurantId: string | undefined = undefined
  let menuPicturesCompleted = false
  let openingTimesCompleted = false
  let contactInfoCompleted = false

  // If owner exists, check for restaurant
  if (personalInfoCompleted && owner) {
    const restaurant = await db.restaurant.findFirst({
      where: {
        ownerId: owner.id,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        reservationUrl: true,
      },
    })

    restaurantInfoCompleted = !!restaurant

    // If restaurant exists, check for other steps
    if (restaurantInfoCompleted && restaurant) {
      restaurantId = restaurant.id

      // Check if menu pictures exist
      // const imageCount = await db.restaurantImage.count({
      //   where: {
      //     restaurantId: restaurant.id,
      //   },
      //   take: 1,
      // })

      // menuPicturesCompleted = imageCount > 0
      menuPicturesCompleted = true

      // Check if opening hours exist
      // const hoursCount = await db.openingHours.count({
      //   where: {
      //     restaurantId: restaurant.id,
      //   },
      //   take: 1,
      // })

      // openingTimesCompleted = hoursCount > 0
      openingTimesCompleted = true

      // contactInfoCompleted =
      //   !!restaurant.phone || !!restaurant.email || !!restaurant.reservationUrl
      contactInfoCompleted = true
    }
  }

  // Determine current step and completion status
  let currentStep: OnboardingStep = 'personal-info'

  if (personalInfoCompleted && !restaurantInfoCompleted) {
    currentStep = 'restaurant-info'
  } else if (restaurantInfoCompleted && !menuPicturesCompleted) {
    currentStep = 'menu-pictures'
  } else if (menuPicturesCompleted && !openingTimesCompleted) {
    currentStep = 'opening-times'
  } else if (openingTimesCompleted && !contactInfoCompleted) {
    currentStep = 'contact-info'
  } else if (
    personalInfoCompleted &&
    restaurantInfoCompleted &&
    menuPicturesCompleted &&
    openingTimesCompleted &&
    contactInfoCompleted
  ) {
    currentStep = 'completed'
  }

  // All steps completed?
  const completed = currentStep === 'completed'

  return {
    currentStep,
    userId,
    completed,
    ownerId: owner?.id,
    restaurantId,
    personalInfoCompleted,
    restaurantInfoCompleted,
    menuPicturesCompleted,
    openingTimesCompleted,
    contactInfoCompleted,
  }
}

/**
 * For server components, determine the next step without state updates
 */
export function getNextStep(currentStep: OnboardingStep): OnboardingStep {
  switch (currentStep) {
    case 'personal-info':
      return 'restaurant-info'
    case 'restaurant-info':
      return 'menu-pictures'
    case 'menu-pictures':
      return 'opening-times'
    case 'opening-times':
      return 'contact-info'
    case 'contact-info':
      return 'completed'
    default:
      return 'completed'
  }
}
