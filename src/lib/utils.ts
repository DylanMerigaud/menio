import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared Google Maps API loader configuration
export const GOOGLE_MAPS_API_ID = 'google-map-script'

// Define libraries for Google Maps API
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing'] as Array<
  'places' | 'geometry' | 'drawing'
>
