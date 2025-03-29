import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Constants
const DOMAIN = 'menio.app'
const DASHBOARD_SUBDOMAIN = `dashboard.${DOMAIN}`

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/restaurant/:slug*',
  '/(api|trpc)(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

/**
 * Determines if a hostname is a restaurant subdomain
 * @param hostname The hostname from the request
 * @returns boolean indicating if this is a restaurant subdomain
 */
function isRestaurantSubdomain(hostname: string): boolean {
  return (
    hostname.endsWith(`.${DOMAIN}`) &&
    hostname !== DASHBOARD_SUBDOMAIN &&
    hostname !== DOMAIN
  )
}

/**
 * Extracts the subdomain from the hostname
 * @param hostname The hostname from the request
 * @returns The subdomain or null if not a subdomain
 */
function extractSubdomain(hostname: string): string | null {
  if (!isRestaurantSubdomain(hostname)) return null
  return hostname.replace(`.${DOMAIN}`, '')
}

/**
 * Handles subdomain routing
 * @param request The Next.js request object
 * @returns A rewrite response or null if no rewrite is needed
 */
async function handleSubdomainRouting(
  request: NextRequest,
): Promise<NextResponse | null> {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Get subdomain
  const subdomain = extractSubdomain(hostname)

  // If this is a restaurant subdomain, rewrite to the restaurant page
  if (subdomain) {
    // Create a new URL using the subdomain as the slug
    const newUrl = new URL(`/restaurant/${subdomain}`, url)
    // Preserve any additional path and search params
    newUrl.pathname = newUrl.pathname + url.pathname
    newUrl.search = url.search

    return NextResponse.rewrite(newUrl)
  }

  // No rewrite needed
  return null
}

export default clerkMiddleware(async (auth, req) => {
  // Cast request to NextRequest
  const request = req as unknown as NextRequest
  const hostname = request.headers.get('host') || ''

  // Handle subdomain routing first
  const rewriteResponse = await handleSubdomainRouting(request)
  if (rewriteResponse) {
    return rewriteResponse
  }

  // Skip Clerk auth ONLY for restaurant subdomain requests
  if (isRestaurantSubdomain(hostname)) {
    return NextResponse.next()
  }

  // For non-subdomain routes, apply normal auth rules
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!api|_next|_vercel|.*\\..*$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
