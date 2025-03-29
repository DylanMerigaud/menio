import { type MetadataRoute } from 'next'
import { db } from '@/server/db'

// This generates a sitemap dynamically for all restaurants and static pages
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all published restaurants for the sitemap
  const restaurants = await db.restaurant.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Base URL (use environment variable or fallback)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://menio.app'

  // Main static page (homepage)
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
  ]

  // Restaurant pages (subdomain URLs + /restaurant/[slug] path)
  const restaurantPages = restaurants.flatMap((restaurant) => [
    // Subdomain URL
    {
      url: `https://${restaurant.slug}.menio.app`,
      lastModified: restaurant.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Path-based URL
    {
      url: `${baseUrl}/restaurant/${restaurant.slug}`,
      lastModified: restaurant.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ])

  return [...staticPages, ...restaurantPages]
}
