import { ImageResponse } from 'next/og'
import { db } from '@/server/db'
import { getTranslations } from 'next-intl/server'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

// This route generates dynamic Open Graph images for each restaurant
export default async function Image({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const t = await getTranslations('common')

  // Fetch restaurant data from Db
  const data = await db.restaurant.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      name: true,
      description: true,
      address: true,
    },
  })

  const restaurant = {
    name: data?.name || 'Restaurant',
    description: data?.description || 'Description not available',
    cuisine: 'Restaurant', // This could be added to your schema
    priceRange: '€€', // This could be added to your schema
    address: data?.address || 'Address not available',
  }

  // You could also fetch and use a real restaurant image as the background
  // const image = await fetch(new URL(`../../../public/sample/restaurant-1.jpg`, import.meta.url)).then(
  //   (res) => res.arrayBuffer(),
  // )

  return new ImageResponse(
    (
      <div
        style={{
          background: 'hsl(0 0% 0%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* This would be a background image in production */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(hsla(0, 0%, 0%, 0.5), hsla(0, 0%, 0%, 0.8))',
            zIndex: 1,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            padding: '0 48px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'hsl(0 0% 100%)',
              marginBottom: 24,
              textShadow: '0 2px 10px hsla(0, 0%, 0%, 0.3)',
              letterSpacing: -1,
            }}
          >
            {restaurant.name}
          </div>

          <div
            style={{
              fontSize: 32,
              color: 'hsl(0 0% 100%)',
              marginBottom: 48,
              maxWidth: 800,
              textShadow: '0 2px 4px hsla(0, 0%, 0%, 0.5)',
            }}
          >
            {restaurant.description}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                background: 'hsla(0, 0%, 100%, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid hsla(0, 0%, 100%, 0.2)',
                padding: '12px 24px',
                borderRadius: 8,
                color: 'hsl(0 0% 100%)',
                fontSize: 24,
              }}
            >
              {restaurant.cuisine}
            </div>

            <div
              style={{
                background: 'hsla(0, 0%, 100%, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid hsla(0, 0%, 100%, 0.2)',
                padding: '12px 24px',
                borderRadius: 8,
                color: 'hsl(0 0% 100%)',
                fontSize: 24,
              }}
            >
              {restaurant.priceRange}
            </div>
          </div>

          <div
            style={{
              fontSize: 20,
              color: 'hsla(0, 0%, 100%, 0.8)',
            }}
          >
            {restaurant.address}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            fontSize: 16,
            color: 'hsla(0, 0%, 100%, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 10,
          }}
        >
          {t('poweredBy')}
          <span
            style={{
              fontWeight: 'bold',
              color: 'hsl(152 65% 49%)',
            }}
          >
            {t('menio')}
          </span>
        </div>
      </div>
    ),
    size,
  )
}
