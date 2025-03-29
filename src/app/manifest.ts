import { type MetadataRoute } from 'next'

// This manifest file provides web app information for PWA functionality
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Menio - Restaurant Website Builder',
    short_name: 'Menio',
    description: 'Create a beautiful website for your restaurant instantly',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2acf80',
  }
}
