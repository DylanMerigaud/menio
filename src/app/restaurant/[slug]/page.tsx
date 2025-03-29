import { type Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { db } from '@/server/db'
import { notFound } from 'next/navigation'
import { RestaurantWebsite } from '@/components/RestaurantWebsite'
import { RestaurantOwnerBanner } from '@/components/RestaurantOwnerBanner'
import { auth } from '@clerk/nextjs/server'
import { getTranslations } from 'next-intl/server'

// Metadata generation for SEO - Server Component
export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const params = await props.params

  const { locale, slug } = params

  // Get translations for this locale
  const t = await getTranslations({ locale, namespace: 'generatedSite' })

  // Fetch the restaurant data from Db with all necessary relations
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: slug,
    },
    include: {
      openingHours: true,
      addressInfo: true,
      images: {
        include: {
          upload: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      },
      menu: {
        include: {
          upload: true,
        },
      },
      socialLinks: true,
    },
  })

  if (!restaurant) {
    console.log('Restaurant not found')
    notFound()
  }

  // Format opening hours for metadata
  const dayMapping = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  const openingHours = restaurant.openingHours.reduce(
    (acc, curr) => {
      const day = dayMapping[curr.dayOfWeek] || 'unknown'
      // Format DateTime objects to HH:MM strings
      const openTimeStr = curr.openTime.toTimeString().slice(0, 5)
      const closeTimeStr = curr.closeTime.toTimeString().slice(0, 5)

      // If we have a time slot for this day already, keep it (first one)
      if (!acc[day]) {
        acc[day] = `${openTimeStr}-${closeTimeStr}`
      }
      return acc
    },
    {} as Record<string, string>,
  )

  // Fill in any missing days with "Closed"
  dayMapping.forEach((day) => {
    if (!openingHours[day]) {
      openingHours[day] = t('closed')
    }
  })

  // Get neighborhood from address if available
  const neighborhoodFromAddress =
    restaurant.addressInfo?.city ||
    restaurant.address.split(',').slice(-2, -1)[0]?.trim() ||
    'Paris' // Fallback city

  // Additional metadata for SEO - using only what we have from the database
  const restaurantWithMetadata = {
    ...restaurant,
    neighborhood: neighborhoodFromAddress,
    openingHours,
  }

  // Use primary image from the database if available
  const mainImageUrl =
    restaurant.images.length > 0 && restaurant.images[0].upload
      ? restaurant.images[0].upload.url
      : null

  // In production, you would use the restaurant's actual domain
  const restaurantDomain = `${slug}.menio.app`

  // Construct a URL for this specific restaurant site
  const restaurantUrl = `https://${restaurantDomain}`

  // Format address for structured data using only data we have
  const addressParts = restaurant.addressInfo

  const structuredAddress = addressParts
    ? {
        '@type': 'PostalAddress',
        streetAddress: addressParts.street || restaurant.address,
        addressLocality: addressParts.city,
        addressRegion: addressParts.state,
        postalCode: addressParts.zip,
        addressCountry: addressParts.country,
      }
    : null

  // Create opening hours specification for structured data
  // This is a simplified implementation - in a real app, this would be more detailed
  const openingHoursSpecification = restaurant.openingHours.map((oh) => {
    const dayName = dayMapping[oh.dayOfWeek] || ''
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)

    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: capitalizedDay,
      opens: oh.openTime.toTimeString().slice(0, 5),
      closes: oh.closeTime.toTimeString().slice(0, 5),
    }
  })

  return {
    title: {
      absolute: `${restaurantWithMetadata.name} | ${restaurantWithMetadata.neighborhood || ''}`,
    },
    description: `${restaurantWithMetadata.description || ''} ${t('restaurantIn')} ${restaurantWithMetadata.neighborhood || ''}. ${restaurantWithMetadata.openingHours.monday ? `${t('openToday')}: ${restaurantWithMetadata.openingHours.monday}` : ''}`,
    alternates: {
      canonical: `${restaurantUrl}`,
    },
    robots: {
      index: restaurantWithMetadata.published,
      follow: restaurantWithMetadata.published,
      googleBot: {
        index: restaurantWithMetadata.published,
        follow: restaurantWithMetadata.published,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      // OpenGraph only supports limited types, using 'website' as fallback
      type: 'website',
      title: restaurantWithMetadata.name,
      description: restaurantWithMetadata.description || '',
      url: restaurantUrl,
      locale: locale,
      siteName: restaurantWithMetadata.name,
      ...(mainImageUrl && {
        images: [
          {
            url: mainImageUrl,
            width: 1200,
            height: 630,
            alt: `${restaurantWithMetadata.name} ${t('restaurantIn').toLowerCase()} ${restaurantWithMetadata.neighborhood || ''}`,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurantWithMetadata.name,
      description: restaurantWithMetadata.description || '',
      ...(mainImageUrl && { images: [mainImageUrl] }),
    },
    // Structured data for the restaurant
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: restaurantWithMetadata.name,
        description: restaurantWithMetadata.description || '',
        ...(mainImageUrl && { image: mainImageUrl }),
        url: restaurantUrl,
        ...(restaurant.phone && { telephone: restaurant.phone }),
        address: structuredAddress,
        ...(addressParts?.latitude &&
          addressParts?.longitude && {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: addressParts.latitude,
              longitude: addressParts.longitude,
            },
          }),
        ...(openingHoursSpecification.length > 0 && {
          openingHoursSpecification: openingHoursSpecification,
        }),
      }),
    },
  }
}

// Get restaurant data directly from the server
async function getRestaurantData(slug: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: {
        slug: slug,
      },
      include: {
        openingHours: true,
        addressInfo: true,
        images: {
          include: {
            upload: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        menu: {
          include: {
            upload: true,
          },
        },
        socialLinks: true,
      },
    })

    if (!restaurant) {
      console.log('Restaurant not found')
      return null
    }

    return restaurant
  } catch (error) {
    console.error('Error fetching restaurant data:', error)
    return null
  }
}

// Format restaurant data for the website component
function formatRestaurantData(
  restaurantData: Awaited<ReturnType<typeof getRestaurantData>>,
) {
  if (!restaurantData) {
    console.log('Restaurant data not found')
    notFound() // If no data is found, redirect to 404 page
  }

  // Map day number to day name
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  // Create a dictionary to group time slots by day
  const daySlots: Record<
    string,
    { isOpen: boolean; slots: Array<{ start: string; end: string }> }
  > = {}

  dayNames.forEach((day) => {
    daySlots[day] = { isOpen: false, slots: [] }
  })

  // Group time slots by day
  restaurantData.openingHours?.forEach((oh) => {
    const day = dayNames[oh.dayOfWeek] || 'unknown'

    if (!daySlots[day]) {
      daySlots[day] = { isOpen: false, slots: [] }
    }

    // Format timestamps to HH:MM strings
    const openTime = new Date(oh.openTime)
    const closeTime = new Date(oh.closeTime)

    const openTimeStr = `${openTime.getUTCHours().toString().padStart(2, '0')}:${openTime.getUTCMinutes().toString().padStart(2, '0')}`
    const closeTimeStr = `${closeTime.getUTCHours().toString().padStart(2, '0')}:${closeTime.getUTCMinutes().toString().padStart(2, '0')}`

    daySlots[day].isOpen = true
    daySlots[day].slots.push({
      start: openTimeStr,
      end: closeTimeStr,
    })
  })

  // Convert the dictionary to an array format needed by the component
  const openingHours = Object.entries(daySlots).map(([day, data]) => ({
    day,
    isOpen: data.isOpen,
    slots: data.slots,
  }))

  return {
    name: restaurantData.name,
    slug: restaurantData.slug,
    description: restaurantData.description || '',
    status: restaurantData.published ? 'published' : 'notPublished',
    openingHours,
    address:
      restaurantData.addressInfo?.addressFormatted || restaurantData.address,
    latitude: restaurantData.addressInfo?.latitude || undefined,
    longitude: restaurantData.addressInfo?.longitude || undefined,
    contactInfo: {
      phone: restaurantData.phone || null,
      email: restaurantData.email || null,
      reservationUrl: restaurantData.reservationUrl || null,
      socialMedia: {
        facebook:
          restaurantData.socialLinks?.find(
            (link) => link.networkType === 'FACEBOOK',
          )?.username || null,
        instagram:
          restaurantData.socialLinks?.find(
            (link) => link.networkType === 'INSTAGRAM',
          )?.username || null,
        x:
          restaurantData.socialLinks?.find(
            (link) => link.networkType === ('X' as const),
          )?.username || null,
        tiktok:
          restaurantData.socialLinks?.find(
            (link) => link.networkType === 'TIKTOK',
          )?.username || null,
        youtube:
          restaurantData.socialLinks?.find(
            (link) => link.networkType === 'YOUTUBE',
          )?.username || null,
      },
    },
    menu: restaurantData.menu?.upload.url || null,
    images: restaurantData.images?.map((img) => img.upload.url) || [],
  }
}

export default async function RestaurantPage(props: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await props.params

  // Get current authentication status
  const session = await auth()
  const isAuthenticated = !!session?.userId

  // Fetch restaurant data directly from the server
  const restaurantData = await getRestaurantData(slug)

  // If restaurant not found, show 404 page
  if (!restaurantData) {
    console.log('Restaurant not found')
    notFound()
  }

  // Check if current user is the owner of this restaurant
  let isOwner = false
  if (isAuthenticated) {
    const owner = await db.owner.findFirst({
      where: {
        userId: session.userId,
      },
    })

    if (owner) {
      isOwner = owner.id === restaurantData.ownerId
    }
  }

  // If restaurant is not published and user is not the owner, show 404 page
  if (!restaurantData.published && !isOwner) {
    console.log('Restaurant not published and user is not the owner')
    notFound()
  }

  // Format the data for the website component
  const restaurant = formatRestaurantData(restaurantData)

  return (
    <div className="relative bg-[#F5F5F5]">
      {isOwner && (
        <RestaurantOwnerBanner
          restaurantId={restaurantData.id}
          isPublished={restaurantData.published}
        />
      )}
      <RestaurantWebsite restaurant={restaurant} />
    </div>
  )
}
