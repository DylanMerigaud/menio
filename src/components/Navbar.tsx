'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { Link, pathnames, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Menu, Settings, ShieldCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import ThemeToggle from './ThemeToggle'
import LocaleSwitcher from './LocaleSwitcher'
import { UserButton } from '@clerk/nextjs'
import MenioFull from './ui/images/menio-full.svg'
import { cn } from '@/utils/tailwind'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu'
import { api } from '@/trpc/react'

type NavItem = {
  href: string
  label: string
  isActive?: (pathname: string) => boolean
  isActivePattern?: string // New pattern-based approach
}

type NavbarProps = {
  navItems?: NavItem[]
  showAdminButton?: boolean
}

export default function Navbar({
  navItems = [],
  showAdminButton = true,
}: NavbarProps) {
  const t = useTranslations()
  const pathname = usePathname()

  // Check if current user is admin
  const { data: currentOwner } = api.owners.getOwner.useQuery(undefined, {
    // Silently fail if not logged in or owner not found
    retry: false,
    refetchOnWindowFocus: false,
  })
  const isAdmin = currentOwner?.isAdmin ?? false

  return (
    <header
      className={'bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm'}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Link href={pathnames['/dashboard']} className="flex items-center">
            <MenioFull className={cn('fill-foreground size-20')} alt="Menio" />
          </Link>
        </div>

        <div className="flex flex-1" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                item.isActive?.(pathname) ||
                (item.isActivePattern && pathname === item.isActivePattern)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin Button - only shown for admin users */}
          {showAdminButton && isAdmin && (
            <Link
              href={pathnames['/dashboard/admin']}
              className="flex items-center"
            >
              <Button variant="outline" size="sm" className="gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t('common.settings')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem>
                  <LocaleSwitcher />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ThemeToggle />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-2 flex justify-center">
              <UserButton
                fallback={
                  <div className="bg-muted h-7 w-7 shrink-0 animate-pulse rounded-full" />
                }
              />
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('common.toggleMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-4">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">
                  {t('common.menu')}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 pl-7">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-base font-medium ${
                      item.isActive?.(pathname) ||
                      (item.isActivePattern &&
                        pathname === item.isActivePattern)
                        ? 'text-primary'
                        : 'text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Admin Button - only shown for admin users (mobile) */}
                {showAdminButton && isAdmin && (
                  <Link
                    href={pathnames['/dashboard/admin']}
                    className="text-primary flex items-center gap-2 font-medium"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <div className="mr-2 flex justify-center">
                    <UserButton
                      fallback={
                        <div className="bg-muted h-7 w-7 shrink-0 animate-pulse rounded-full" />
                      }
                    />
                  </div>

                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
