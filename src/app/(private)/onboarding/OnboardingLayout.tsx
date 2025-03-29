'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import Navbar from '@/components/Navbar'
import { getOnboardingState } from '@/services/onboarding'
import { useUser } from '@clerk/nextjs'
import { useOnboarding } from '@/hooks/useOnboarding'

// Types matching server component
type OnboardingStepName =
  | 'personal-info'
  | 'restaurant-info'
  | 'menu-pictures'
  | 'opening-times'
  | 'contact-info'

const stepOrder: OnboardingStepName[] = [
  'personal-info',
  'restaurant-info',
  'menu-pictures',
  'opening-times',
  'contact-info',
]

function getStepStatus(
  stepName: string,
  pathname: string,
): 'complete' | 'current' | 'upcoming' {
  // Extract the step name from the pathname (e.g., /en/onboarding/personal-info -> personal-info)
  const pathSegments = pathname.split('/')
  const pathStep = pathSegments[pathSegments.length - 1] as OnboardingStepName

  // If the pathname matches this step, it's the current step
  if (pathStep === stepName) return 'current'

  // Use the order to determine if it's complete or upcoming
  const pathIndex = stepOrder.indexOf(pathStep)
  const stepIndex = stepOrder.indexOf(stepName as OnboardingStepName)

  if (stepIndex < pathIndex) return 'complete'
  return 'upcoming'
}

export default function OnboardingLayoutClient({
  children,
  translations,
}: {
  children: React.ReactNode
  translations: Record<string, string>
}) {
  const pathname = usePathname()

  // Define steps with status based on current URL path
  const steps = [
    {
      id: 1,
      name: translations['onboarding.personalInfo.title'] || 'Personal Info',
      href: `/onboarding/personal-info`,
      status: getStepStatus('personal-info', pathname),
    },
    {
      id: 2,
      name:
        translations['onboarding.restaurantInfo.title'] || 'Restaurant Info',
      href: `/onboarding/restaurant-info`,
      status: getStepStatus('restaurant-info', pathname),
    },
    {
      id: 3,
      name:
        translations['onboarding.menuAndPictures.title'] || 'Menu & Pictures',
      href: `/onboarding/menu-pictures`,
      status: getStepStatus('menu-pictures', pathname),
    },
    {
      id: 4,
      name: translations['onboarding.openingTimes.title'] || 'Opening Times',
      href: `/onboarding/opening-times`,
      status: getStepStatus('opening-times', pathname),
    },
    {
      id: 5,
      name: translations['onboarding.contactInfo.title'] || 'Contact Info',
      href: `/onboarding/contact-info`,
      status: getStepStatus('contact-info', pathname),
    },
  ] as const

  const router = useRouter()

  const { completed } = useOnboarding()

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-background container mx-auto max-w-6xl py-8">
        <div className="bg-background rounded-lg p-6">
          <div className="mb-8">
            <Stepper
              value={
                (steps.findIndex((step) => step.status === 'current') || 0) + 1
              }
              onValueChange={(index) => {
                const step = steps[index - 1]
                if (step) {
                  router.push(step.href)
                }
              }}
            >
              {steps.map(({ id, name, status }, index) => (
                <StepperItem
                  disabled={status === 'upcoming' && !completed}
                  key={id}
                  step={id}
                  className="relative flex-1 flex-col!"
                >
                  <StepperTrigger className="flex-col gap-3 rounded">
                    <StepperIndicator />
                    <div className="hidden space-y-0.5 px-2 sm:block">
                      <StepperTitle>{name}</StepperTitle>
                    </div>
                  </StepperTrigger>
                  {index < steps.length - 1 && (
                    <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                  )}
                </StepperItem>
              ))}
            </Stepper>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
