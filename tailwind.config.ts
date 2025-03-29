import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Social media brand colors
        facebook: 'var(--facebook)',
        instagram: 'var(--instagram)',
        x: 'var(--x)',
        tiktok: 'var(--tiktok)',
        youtube: 'var(--youtube)',
      },
    },
  },
}

export default config
