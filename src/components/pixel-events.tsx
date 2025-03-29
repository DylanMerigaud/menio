'use client'
import type React from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePathname } from '@/i18n/routing'

export const FacebookPixelEvents: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    void import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID!)
        ReactPixel.pageView()
      })
  }, [pathname, searchParams])

  return null
}
