'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { Link } from '@/i18n/routing'
import { cn } from '@/utils/tailwind'

export interface FormButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  isPending?: boolean
  previousHref?: string
  isFirstStep?: boolean
  isLastStep?: boolean
}

const FormButtons = React.forwardRef<HTMLDivElement, FormButtonsProps>(
  (
    {
      isPending = false,
      previousHref,
      isFirstStep = false,
      isLastStep = false,
      className,
      ...props
    },
    ref,
  ) => {
    const t = useTranslations()

    return (
      <div
        ref={ref}
        className={cn(
          'bg-background/80 sticky bottom-0 z-40 mt-16 flex justify-between p-2 backdrop-blur-sm',
          className,
        )}
        {...props}
      >
        {!isFirstStep && previousHref && (
          <Button type="button" variant="outline" asChild>
            <Link href={previousHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.previous')}
            </Link>
          </Button>
        )}

        <div className="ml-auto">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving', { default: 'Saving...' })}
              </span>
            ) : (
              <>
                {isLastStep ? t('common.submit') : t('common.nextStep')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  },
)

FormButtons.displayName = 'FormButtons'

export { FormButtons }
