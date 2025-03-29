'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { Link, usePathname } from '@/i18n/routing'
import { LayoutDashboard, Edit, HelpCircle, FileText, Menu } from 'lucide-react'
import LocaleSwitcher from './LocaleSwitcher'
import { cn } from '@/utils/tailwind'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function DashboardSidebar() {
  const t = useTranslations()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: `/dashboard`,
      label: t('dashboard.overview'),
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: `/onboarding/personal-info`,
      label: t('dashboard.editSite'),
      icon: <Edit className="h-5 w-5" />,
    },
    {
      href: `/dashboard/assistance`,
      label: t('dashboard.assistance'),
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      href: `/dashboard/terms`,
      label: t('dashboard.termsAndConditions'),
      icon: <FileText className="h-5 w-5" />,
    },
  ]

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <a key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground',
                )}
                size="sm"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Button>
            </a>
          )
        })}
      </nav>
      <Separator className="my-2" />
      <div className="px-4 py-2">
        <LocaleSwitcher />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="bg-background hidden h-screen flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">{t('common.menio')}</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between py-2">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="flex h-14 items-center border-b px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t('common.toggleMenu')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="w-64">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold">
                      {t('common.menio')}
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-1 flex-col justify-between py-4">
                <SidebarContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">{t('common.menio')}</span>
        </Link>
      </div>
    </>
  )
}
