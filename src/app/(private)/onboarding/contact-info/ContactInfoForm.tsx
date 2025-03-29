'use client'

import { useForm } from 'react-hook-form'
import { useTranslations } from '@/i18n/useTypedTranslations'
import { useRouter } from '@/i18n/routing'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { PhoneInput } from '@/components/ui/phone-input'
import { FormButtons } from '@/components/ui/form-buttons'
import { api } from '@/utils/trpc'
import { useSession } from '@clerk/nextjs'
import React, { useState } from 'react'
import { useLocale } from 'next-intl'
import en from 'react-phone-number-input/locale/en'
import fr from 'react-phone-number-input/locale/fr'
import type { LabelKey } from 'react-phone-number-input'
import type { Control } from 'react-hook-form'
import XIcon from '@/components/ui/icons/x.svg'
import Facebook from '@/components/ui/icons/facebook.svg'
import Instagram from '@/components/ui/icons/instagram.svg'
import TikTok from '@/components/ui/icons/tiktok.svg'
import YouTube from '@/components/ui/icons/youtube.svg'
import {
  type RestaurantSocialLink,
  type SocialNetworkType,
} from '@prisma/client'
import { Separator } from '@/components/ui/separator'

type FormValues = {
  phone?: string
  email?: string
  reservationUrl?: string
  facebook?: string
  instagram?: string
  x?: string
  tiktok?: string
  youtube?: string
}

interface SocialMediaInputProps {
  control: Control<FormValues>
  name: Lowercase<SocialNetworkType>
  platform: SocialNetworkType
}

function SocialMediaInput({ control, name, platform }: SocialMediaInputProps) {
  const t = useTranslations()

  const getLogo = () => {
    switch (platform) {
      case 'FACEBOOK':
        return <Facebook className="text-facebook h-4 w-4" />
      case 'INSTAGRAM':
        return <Instagram className="text-instagram h-4 w-4" />
      case 'X':
        return <XIcon className="text-x h-4 w-4" />
      case 'TIKTOK':
        return <TikTok className="text-tiktok h-4 w-4" />
      case 'YOUTUBE':
        return <YouTube className="text-youtube h-4 w-4" />
      default:
        return null
    }
  }

  const getPrefixText = () => {
    switch (platform) {
      case 'FACEBOOK':
        return 'facebook.com/'
      case 'INSTAGRAM':
        return 'instagram.com/'
      case 'X':
        return 'x.com/'
      case 'TIKTOK':
        return 'tiktok.com/@'
      case 'YOUTUBE':
        return 'youtube.com/@'
      default:
        return ''
    }
  }

  const getValidationRules = () => {
    return {
      validate: (value: string | undefined) => {
        // Allow empty values (no social media)
        if (!value || value.trim() === '') return true

        // No need for additional validation as we're expecting only username

        return true
      },
    }
  }

  // Function to extract username from full URL
  const extractUsername = (
    url: string,
    platform: SocialNetworkType,
  ): string => {
    if (!url) return url

    // Define regex patterns for different platforms
    const patterns: Record<SocialNetworkType, RegExp> = {
      FACEBOOK: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/\?]+)/i,
      INSTAGRAM: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?]+)/i,
      X: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^\/\?]+)/i,
      TIKTOK: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^\/\?]+)/i,
      YOUTUBE: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?([^\/\?]+)/i,
    }

    const match = url.match(patterns[platform])
    return match ? match[1] : url
  }

  return (
    <FormField
      control={control}
      name={name}
      rules={getValidationRules()}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(`onboarding.contactInfo.${name}.title`)}</FormLabel>
          <FormControl>
            <div className="flex">
              <div className="border-input bg-card flex items-center justify-center rounded-l-md border border-r-0 px-3">
                {getLogo()}
              </div>
              <div className="border-input bg-muted text-muted-foreground flex items-center border border-r-0 px-3 text-sm">
                {getPrefixText()}
              </div>
              <Input
                {...field}
                type="text"
                placeholder={t(`onboarding.contactInfo.${name}.placeholder`)}
                className="rounded-l-none"
                onChange={(e) => {
                  // Extract username from pasted URL if needed
                  const inputValue = e.target.value
                  const extractedValue = extractUsername(inputValue, platform)
                  field.onChange(extractedValue)
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default function ContactInfoForm() {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const session = useSession()

  const { data: restaurantWithDetails } =
    api.restaurants.getRestaurantWithOpeningHours.useQuery()

  // Safely access session user data
  const userPhoneNumber =
    session?.session?.user?.primaryPhoneNumber?.phoneNumber ?? ''
  const userEmail =
    session?.session?.user?.primaryEmailAddress?.emailAddress ?? ''

  const mutation = api.restaurants.upsertContactInfo.useMutation({
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error(error)
    },
  })

  // Get social links from restaurant data
  const socialLinks = restaurantWithDetails?.socialLinks || []

  // Find social links by type and get username
  const getFacebookLink = () => {
    const link = socialLinks.find(
      (link: RestaurantSocialLink) => link.networkType === 'FACEBOOK',
    )
    return link ? link.username : ''
  }

  const getInstagramLink = () => {
    const link = socialLinks.find(
      (link: RestaurantSocialLink) => link.networkType === 'INSTAGRAM',
    )
    return link ? link.username : ''
  }

  const getXLink = () => {
    const link = socialLinks.find(
      (link: RestaurantSocialLink) => link.networkType === 'X',
    )
    return link ? link.username : ''
  }

  const getTikTokLink = () => {
    const link = socialLinks.find(
      (link: RestaurantSocialLink) => link.networkType === 'TIKTOK',
    )
    return link ? link.username : ''
  }

  const getYouTubeLink = () => {
    const link = socialLinks.find(
      (link: RestaurantSocialLink) => link.networkType === 'YOUTUBE',
    )
    return link ? link.username : ''
  }

  const form = useForm<FormValues>({
    defaultValues: {
      phone: restaurantWithDetails?.phone || userPhoneNumber || '',
      email: restaurantWithDetails?.email || userEmail || '',
      reservationUrl: restaurantWithDetails?.reservationUrl || '',
      facebook: getFacebookLink(),
      instagram: getInstagramLink(),
      x: getXLink(),
      tiktok: getTikTokLink(),
      youtube: getYouTubeLink(),
    },
  })

  // Process form data for submission
  const processFormData = (data: FormValues) => {
    return {
      phone: data.phone || undefined,
      email: data.email || undefined,
      reservationUrl: data.reservationUrl || undefined,
      facebook: data.facebook || undefined,
      instagram: data.instagram || undefined,
      x: data.x || undefined,
      tiktok: data.tiktok || undefined,
      youtube: data.youtube || undefined,
    }
  }

  function onSubmit(data: FormValues) {
    // Process form data
    const processedData = processFormData(data)

    // Send the processed data to the API
    mutation.mutate(processedData)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-10"
      >
        {/* Contact Section */}
        <h3 className="mb-6 text-xl font-medium">
          {t('onboarding.contactInfo.contact')}
        </h3>

        {/* Responsive grid for contact fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            rules={{
              validate: (value) => {
                // Allow empty values
                if (!value || value.trim() === '') return true

                // PhoneInput validates the format automatically
                return true
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.contactInfo.phone')}</FormLabel>
                <FormDescription>
                  {t('onboarding.contactInfo.phoneDescription')}
                </FormDescription>
                <FormControl>
                  <PhoneInput
                    defaultCountry="FR"
                    value={field.value}
                    onChange={field.onChange}
                    international
                    labels={
                      (locale === 'fr' ? fr : en) as Partial<
                        Record<LabelKey, string>
                      >
                    }
                    locales={['fr', 'en']}
                    lang={locale}
                    countryCallingCodeEditable={false}
                    placeholder={t('onboarding.contactInfo.phonePlaceholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('onboarding.contactInfo.invalidEmail'),
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('onboarding.contactInfo.email')}</FormLabel>
                <FormDescription>
                  {t('onboarding.contactInfo.emailDescription')}
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="exemple@gmail.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Reservations Section */}

        <h3 className="mb-6 text-xl font-medium">
          {t('onboarding.contactInfo.reservations')}
        </h3>

        <FormField
          control={form.control}
          name="reservationUrl"
          rules={{
            validate: (value) => {
              // Allow empty values (no reservations)
              if (!value || value.trim() === '') return true

              // Check URL pattern if value is provided
              return (
                /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(
                  value,
                ) || t('onboarding.contactInfo.invalidUrl')
              )
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('onboarding.contactInfo.reservationUrl')}
              </FormLabel>
              <FormDescription>
                {t('onboarding.contactInfo.reservationUrlDescription')}
              </FormDescription>
              <FormControl>
                <Input {...field} type="url" placeholder="https://" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Social Media Section */}

        <h3 className="mb-6 text-xl font-medium">
          {t('onboarding.contactInfo.socialMedia')}
        </h3>

        {/* Responsive grid for social media inputs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SocialMediaInput
            control={form.control}
            name="facebook"
            platform="FACEBOOK"
          />

          <SocialMediaInput
            control={form.control}
            name="instagram"
            platform="INSTAGRAM"
          />

          <SocialMediaInput control={form.control} name="x" platform="X" />

          <SocialMediaInput
            control={form.control}
            name="tiktok"
            platform="TIKTOK"
          />

          {/* <SocialMediaInput
            control={form.control}
            name="youtube"
            platform="YOUTUBE"
          /> */}
        </div>

        <FormButtons
          isPending={mutation.isPending || mutation.isSuccess}
          previousHref="/onboarding/opening-times"
          isLastStep={true}
        />
      </form>
    </Form>
  )
}
