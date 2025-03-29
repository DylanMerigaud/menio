'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { useTranslations } from '@/i18n/useTypedTranslations'

// Define emojis as variables to avoid linting issues
const EMOJI_PENCIL = '✏️'
const EMOJI_HELP = '🙋‍♂️'
const EMOJI_MAIL = '📮'

type ActionButtonsProps = {
  subdomain: string
}

export function ActionButtons({ subdomain: _subdomain }: ActionButtonsProps) {
  const t = useTranslations()

  const handleEditSiteClick = () => {
    // Track edit site button click
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackEditSiteClick()
    })
  }

  const handleAssistanceClick = () => {
    // Track assistance view
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackAssistanceView()
    })
  }

  const handleContactClick = () => {
    // Track contact us click
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackContactUsClick()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Button variant="secondary" size="xl" className="py-8" asChild>
        <Link
          href="/onboarding/personal-info"
          className="flex flex-col items-center p-6"
          onClick={handleEditSiteClick}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="text-lg" aria-hidden="true">
              {EMOJI_PENCIL}
            </span>{' '}
            {t('dashboard.actions.editSite')}
          </span>
        </Link>
      </Button>

      <Button variant="secondary" size="xl" className="py-8" asChild>
        <Link
          href="/dashboard/assistance"
          className="flex flex-col items-center p-6"
          onClick={handleAssistanceClick}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="text-lg" aria-hidden="true">
              {EMOJI_HELP}
            </span>{' '}
            {t('dashboard.actions.faq')}
          </span>
        </Link>
      </Button>

      <Button variant="secondary" size="xl" className="py-8" asChild>
        <a
          href={`mailto:${t('common.supportEmail')}`}
          className="flex flex-col items-center p-6"
          onClick={handleContactClick}
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="text-lg" aria-hidden="true">
              {EMOJI_MAIL}
            </span>{' '}
            {t('dashboard.actions.contactUs')}
          </span>
        </a>
      </Button>

      {/* <Button variant="secondary" size="xl" className="py-8" asChild>
        <Link
          href="/dashboard/settings"
          className="flex flex-col items-center p-6"
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="text-lg" aria-hidden="true">
              {EMOJI_SETTINGS}
            </span>{' '}
            {t('dashboard.actions.settings')}
          </span>
        </Link>
      </Button> */}
    </div>
  )
}
