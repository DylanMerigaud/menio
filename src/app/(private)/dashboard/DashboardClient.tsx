'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import Navbar from '@/components/Navbar'
import { useTranslations } from '@/i18n/useTypedTranslations'

type DashboardClientProps = {
  children: React.ReactNode
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const t = useTranslations()

  const navItems = [
    {
      href: `/dashboard`,
      label: t('dashboard.overview'),
      isActive: (path: string) => path === `/dashboard`,
    },
    {
      href: `/onboarding/personal-info`,
      label: t('dashboard.editSite'),
      isActive: (path: string) => path.includes('/onboarding'),
    },
    {
      href: `/dashboard/assistance`,
      label: t('dashboard.assistance'),
      isActive: (path: string) => path.includes('/dashboard/assistance'),
    },
    {
      href: `/dashboard/terms`,
      label: t('dashboard.termsAndConditions'),
      isActive: (path: string) => path.includes('/dashboard/terms'),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navItems={navItems} />
      <div className="flex flex-1 flex-col">
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
