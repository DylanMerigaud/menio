'use client'

import { useTranslations } from '@/i18n/useTypedTranslations'
import { useEffect } from 'react'
import { Button } from './ui/button'
import { Phone, Mail, Calendar } from 'lucide-react'
import { captureEvent } from '@/providers/PostHogProvider'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { ImageCarousel } from './ui/image-carousel'
import { Skeleton } from './ui/skeleton'
import XIcon from '@/components/ui/icons/x.svg'
import Facebook from '@/components/ui/icons/facebook.svg'
import Instagram from '@/components/ui/icons/instagram.svg'
import TikTok from '@/components/ui/icons/tiktok.svg'
import YouTube from '@/components/ui/icons/youtube.svg'
import { Badge } from './ui/badge'
import { cn } from '../utils/tailwind'
import { GOOGLE_MAPS_API_ID, GOOGLE_MAPS_LIBRARIES } from '@/lib/utils'
import React from 'react'
import { Card } from './ui/card'
import { getCurrentOpenStatus } from '@/utils/opening-hours'

interface TimeSlot {
  start: string
  end: string
}

interface OpeningDay {
  day: string
  isOpen: boolean
  slots: TimeSlot[]
}

interface SocialMedia {
  facebook: string | null
  instagram: string | null
  x: string | null
  tiktok: string | null
  youtube: string | null
}

interface ContactInfo {
  phone: string | null
  email: string | null
  reservationUrl: string | null
  socialMedia: SocialMedia
}

interface Restaurant {
  name: string
  slug: string
  description: string
  status: string
  openingHours: OpeningDay[]
  address: string
  latitude?: number
  longitude?: number
  contactInfo: ContactInfo
  menu: string | null
  images: string[]
}

interface RestaurantWebsiteProps {
  restaurant: Restaurant
}

interface SocialMediaButtonProps {
  username: string | null
  platform: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube'
  onClick?: () => void
}

function SocialMediaButton({
  username,
  platform,
  onClick,
}: SocialMediaButtonProps) {
  if (!username) return null

  const getUrl = (): string => {
    switch (platform) {
      case 'facebook':
        return `https://facebook.com/${username}`
      case 'instagram':
        return `https://instagram.com/${username}`
      case 'x':
        return `https://x.com/${username}`
      case 'tiktok':
        return `https://tiktok.com/@${username}`
      case 'youtube':
        return `https://youtube.com/@${username}`
      default:
        return '#'
    }
  }

  const getLogo = () => {
    switch (platform) {
      case 'facebook':
        return (
          <Facebook className={`text-facebook h-6 w-6`} aria-hidden="true" />
        )
      case 'instagram':
        return (
          <Instagram className={`text-instagram h-6 w-6`} aria-hidden="true" />
        )
      case 'x':
        return <XIcon className={`text-x h-6 w-6`} aria-hidden="true" />
      case 'tiktok':
        return <TikTok className={`text-tiktok h-6 w-6`} aria-hidden="true" />
      case 'youtube':
        return <YouTube className={`text-youtube h-6 w-6`} aria-hidden="true" />
      default:
        return null
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    captureEvent('social_link_clicked', { platform })
  }

  return (
    <a
      href={getUrl()}
      target="_blank"
      rel="noopener"
      className="hover:text-primary text-muted-foreground transition"
      onClick={handleClick}
      aria-label={platform.charAt(0).toUpperCase() + platform.slice(1)}
    >
      {getLogo()}
    </a>
  )
}

export function RestaurantWebsite({ restaurant }: RestaurantWebsiteProps) {
  const t = useTranslations()

  // Track page view on component mount
  useEffect(() => {
    void import('@/providers/PostHogEvents').then((module) => {
      module.trackRestaurantWebsiteView(restaurant.slug)
    })
  }, [restaurant.slug])

  // Helper function to safely translate day names
  const translateDay = (day: string): string => {
    switch (day) {
      case 'monday':
        return t('onboarding.openingTimes.monday')
      case 'tuesday':
        return t('onboarding.openingTimes.tuesday')
      case 'wednesday':
        return t('onboarding.openingTimes.wednesday')
      case 'thursday':
        return t('onboarding.openingTimes.thursday')
      case 'friday':
        return t('onboarding.openingTimes.friday')
      case 'saturday':
        return t('onboarding.openingTimes.saturday')
      case 'sunday':
        return t('onboarding.openingTimes.sunday')
      default:
        return day
    }
  }

  const openStatus = getCurrentOpenStatus(restaurant.openingHours, translateDay)

  // open
  // const openStatus = {
  //   isOpen: true,
  //   closesSoon: false,
  //   closingTime: '12:00',
  //   nextOpenTime: '12:00',
  //   nextOpenDay: translateDay('monday'),
  // }

  // close
  // const openStatus = {
  //   isOpen: false,
  //   closesSoon: false,
  //   closingTime: '12:00',
  //   nextOpenTime: '12:00',
  //   nextOpenDay: translateDay('monday'),
  // }

  // Fallback text when no content is available
  const fallbackText = (
    content: string | null | undefined,
    fallback: string,
  ) => {
    return content || fallback
  }

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_API_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  return (
    <>
      <div className="client-website bg-background mx-auto mt-16 flex w-full flex-col rounded-4xl lg:max-w-[64rem]">
        <Badge
          className={cn(
            'text-md mx-auto mt-24 p-2',
            openStatus.isOpen &&
              'bg-[#EEF6D6] text-[#5C7C2F] dark:bg-green-900 dark:text-green-300',
            !openStatus.isOpen &&
              'bg-[#f6d6d6] text-[#7c2f2f] dark:bg-red-900 dark:text-red-300',
            openStatus.closesSoon &&
              'bg-[#f6ebd6] text-[#7c692f] dark:bg-orange-900 dark:text-orange-300',
          )}
        >
          {openStatus.isOpen && openStatus.closingTime ? (
            <div className={`flex items-center justify-center gap-2`}>
              {openStatus.closesSoon ? (
                <span>
                  {t('generatedSite.closingSoon', {
                    time: openStatus.closingTime,
                  })}
                </span>
              ) : (
                <span>
                  {t('generatedSite.openUntil', {
                    time: openStatus.closingTime,
                  })}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-400 dark:text-red-300">
              <span>
                {t('generatedSite.openAtWithDay', {
                  time: openStatus.nextOpenTime!,
                  day: openStatus.nextOpenDay!.toLowerCase(),
                })}
              </span>
            </div>
          )}
        </Badge>
        <section className="relative overflow-hidden">
          <div className="relative container mx-auto px-4 pt-12 text-center">
            <h1 className="mb-6 text-6xl font-bold">{restaurant.name}</h1>
            <p className="text-muted-foreground mx-auto mt-6 mb-12 max-w-lg text-lg font-medium">
              {fallbackText(
                restaurant.description,
                t('generatedSite.descriptionPlaceholder'),
              )}
            </p>

            <div className="mx-auto grid max-w-xs grid-cols-2 gap-6">
              {restaurant.contactInfo.reservationUrl && (
                <Button asChild size="xl">
                  <a
                    href={restaurant.contactInfo.reservationUrl}
                    target="_blank"
                    rel="noopener"
                    onClick={() => captureEvent('reservation_button_clicked')}
                  >
                    <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />{' '}
                    {t('common.reserve')}
                  </a>
                </Button>
              )}
              {!restaurant.contactInfo.reservationUrl &&
                restaurant.contactInfo.phone && (
                  <Button asChild size="xl">
                    <a
                      href={`tel:${restaurant.contactInfo.phone}`}
                      onClick={() => captureEvent('phone_link_clicked')}
                    >
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t('common.call')}
                    </a>
                  </Button>
                )}
              {restaurant.menu && (
                <Button variant="secondary" asChild size="xl">
                  <a
                    href={restaurant.menu}
                    target="_blank"
                    rel="noopener"
                    onClick={() => captureEvent('view_menu_button_clicked')}
                  >
                    {t('common.menu')}
                  </a>
                </Button>
              )}
              <Button variant="secondary" asChild size="xl">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                >
                  {t('common.address')}
                </a>
              </Button>
              {/* goto anchor contact link */}
              <Button variant="secondary" asChild size="xl">
                <a href="#contact">{t('generatedSite.contact')}</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Gallery - Only show if we have images */}
        {restaurant.images.length > 0 && (
          <div className="mt-16 px-4">
            <ImageCarousel
              images={restaurant.images.map((image, index) => ({
                src: image,
                alt: `${restaurant.name} - Image ${index + 1}`,
              }))}
              className="mt-8 max-w-3xl"
            />
          </div>
        )}

        {/* Direction Section */}
        <section
          id="direction"
          className="container mx-auto mt-16 flex max-w-3xl flex-col px-4"
        >
          <h2 className="text-center text-2xl font-bold">
            {t('generatedSite.directionTitle')}
          </h2>
          <div className="mx-auto mt-3 text-[#909090]">
            {restaurant.address}
          </div>
          <Button
            variant="default"
            size="lg"
            className="mx-auto mt-8"
            asChild
            onClick={() => captureEvent('directions_button_clicked')}
          >
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener"
              aria-label="Get directions to the restaurant"
            >
              {t('common.getDirections')}
            </a>
          </Button>
          {/* Real Google Maps implementation */}
          {restaurant.latitude && restaurant.longitude && (
            <div className="mx-auto mt-8 h-[500px] w-full overflow-hidden rounded-lg">
              {isLoaded ? (
                <GoogleMap
                  mapTypeId="terrain"
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  zoom={15}
                  center={{
                    lat: restaurant.latitude, // Default to Paris coordinates if not provided
                    lng: restaurant.longitude,
                  }}
                >
                  <Marker
                    position={{
                      lat: restaurant.latitude,
                      lng: restaurant.longitude,
                    }}
                  />
                </GoogleMap>
              ) : (
                <Skeleton className="h-64 w-full overflow-hidden rounded-lg" />
              )}
            </div>
          )}
        </section>

        {/* Opening Times Section */}
        <section id="opening-times" className="mt-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              {t('generatedSite.openingTimes')}
            </h2>
            <div className="flex text-base">
              <ul className="mx-auto grid grid-cols-[max-content_max-content] gap-x-12 gap-y-2">
                {/* Sort days of week in correct order */}
                {[
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ].map((dayName) => {
                  const day = restaurant.openingHours.find(
                    (d) => d.day === dayName,
                  )

                  return (
                    <React.Fragment key={dayName}>
                      <div className="text-base uppercase">
                        {translateDay(dayName).slice(0, 3)}
                      </div>
                      <div className="">
                        {day && day.isOpen && day.slots.length > 0 ? (
                          <div className="flex space-y-1 text-[#909090]">
                            {day.slots
                              .toSorted((a, b) => {
                                const [aHour, aMinute] = a.start
                                  .split(':')
                                  .map(Number)
                                const [bHour, bMinute] = b.start
                                  .split(':')
                                  .map(Number)
                                return (
                                  aHour * 60 + aMinute - (bHour * 60 + bMinute)
                                )
                              })
                              .map((slot, index) => (
                                <div key={index} className="text-right">
                                  {slot.start} {t('common.dash')} {slot.end}
                                  <span className="mx-1">
                                    {index < day.slots.length - 1 && '/'}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span className="text-[#909090]">
                            {t('onboarding.openingTimes.closed')}
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* Menu Section (if available) */}
        {restaurant.menu && (
          <section id="menu" className="container mx-auto mt-16 px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              {t('generatedSite.menu')}
            </h2>

            {/* Menu preview similar to onboarding form */}
            <div className="mx-auto mb-8 max-w-3xl">
              <div className="overflow-hidden rounded border">
                <div className="bg-muted/50 relative flex h-[500px] items-center justify-center">
                  <iframe
                    src={`${restaurant.menu}#toolbar=0&navpanes=0`}
                    className="h-full w-full"
                    title={t('generatedSite.menu')}
                  />
                  <Button
                    variant="outline"
                    className="absolute right-2 bottom-2"
                    onClick={() => captureEvent('view_menu_clicked')}
                    asChild
                  >
                    <a
                      href={restaurant.menu}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('common.open')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section id="contact" className="mt-16">
          <div className="container mx-auto flex flex-col px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">
              {t('generatedSite.contactAndSocial')}
            </h2>
            <div className="text-foreground mx-auto max-w-xl justify-center p-6">
              {/* Contact Information */}
              <div className="mb-16 flex flex-wrap justify-center gap-6">
                {restaurant.contactInfo.reservationUrl && (
                  <Button asChild size="lg">
                    <a
                      href={restaurant.contactInfo.reservationUrl}
                      target="_blank"
                      rel="noopener"
                      onClick={() => captureEvent('reservation_button_clicked')}
                    >
                      <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />{' '}
                      {t('common.reserve')}
                    </a>
                  </Button>
                )}
                {restaurant.contactInfo.phone && (
                  <Button asChild size="lg" variant="secondary">
                    <a
                      href={`tel:${restaurant.contactInfo.phone}`}
                      onClick={() => captureEvent('phone_link_clicked')}
                    >
                      <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t('generatedSite.callUs')}
                    </a>
                  </Button>
                )}

                {restaurant.contactInfo.email && (
                  <Button asChild size="lg" variant="secondary">
                    <a
                      href={`mailto:${restaurant.contactInfo.email}`}
                      onClick={() => captureEvent('email_link_clicked')}
                    >
                      <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                      {t('generatedSite.emailUs')}
                    </a>
                  </Button>
                )}
              </div>

              {/* Social Media - Only show if we have any social links */}
              {(restaurant.contactInfo.socialMedia.facebook ||
                restaurant.contactInfo.socialMedia.instagram ||
                restaurant.contactInfo.socialMedia.x ||
                restaurant.contactInfo.socialMedia.tiktok ||
                restaurant.contactInfo.socialMedia.youtube) && (
                <div className="flex items-center justify-center space-x-6">
                  <SocialMediaButton
                    username={restaurant.contactInfo.socialMedia.facebook}
                    platform="facebook"
                  />
                  <SocialMediaButton
                    username={restaurant.contactInfo.socialMedia.instagram}
                    platform="instagram"
                  />
                  <SocialMediaButton
                    username={restaurant.contactInfo.socialMedia.x}
                    platform="x"
                  />
                  <SocialMediaButton
                    username={restaurant.contactInfo.socialMedia.tiktok}
                    platform="tiktok"
                  />
                  <SocialMediaButton
                    username={restaurant.contactInfo.socialMedia.youtube}
                    platform="youtube"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="mt-16 mb-16 text-center">
        <div className="container mx-auto flex flex-col gap-6">
          <p>
            {restaurant.name} {t('common.dash')} {new Date().getFullYear()}
          </p>
          <Card className="mx-auto px-4 py-3">
            <a
              href="https://menio.app"
              className="hover:text-primary flex gap-1 hover:underline"
              onClick={() => captureEvent('menio_link_clicked')}
            >
              <span className="text-[#909090]">
                {t('generatedSite.websiteCreatedWith')}
              </span>
              <span className="font-bold">{t('common.menio')}</span>
            </a>
          </Card>
        </div>
      </footer>
    </>
  )
}
