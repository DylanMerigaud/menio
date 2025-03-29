import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const runtime = 'edge'

export const alt = 'Menio - Restaurant Website Builder'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const t = await getTranslations('common')
  // In a real implementation, you'd include a nice background here
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(90deg, hsl(152 65% 49%) 0%, hsl(151 80% 37%) 100%)',
          color: 'hsl(0 0% 100%)',
          fontFamily: 'sans-serif',
          padding: 48,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 'bold',
            letterSpacing: -2,
            marginBottom: 24,
          }}
        >
          {t('menio')}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            fontWeight: 'normal',
            letterSpacing: -1,
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          {t('createRestaurantWebsite')}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            color: 'hsl(151 80% 37%)',
            borderRadius: 12,
            padding: '16px 24px',
            fontSize: 24,
            fontWeight: 'medium',
          }}
        >
          {t('getStartedToday')}
        </div>
      </div>
    ),
    size,
  )
}
