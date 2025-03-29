import { type MetadataRoute } from 'next'
import { db } from '@/server/db'

// This dynamic manifest file provides web app information for restaurant websites
export default async function manifest({
  params,
}: {
  params: { locale: string; slug: string }
}): Promise<MetadataRoute.Manifest> {
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      name: true,
    },
  })

  const restaurantName = restaurant?.name || 'Restaurant'
  const restaurantSlug = params.slug

  return {
    name: restaurantName,
    short_name: restaurantName,
    description: 'Restaurant website - Made with Menio',
    start_url: `/${params.locale}/${restaurantSlug}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
  }
}
