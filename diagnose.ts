// Simple diagnostic script for next-intl and routing
console.log('Checking i18n configuration...')

// Set the locales manually to avoid TS import issues
const locales = ['en', 'fr']
const defaultLocale = 'en'
console.log('Available locales:', locales)
console.log('Default locale:', defaultLocale)

// Check the middleware configuration
console.log('\nChecking middleware configuration...')
import * as fs from 'fs'
const middlewarePath = './src/middleware.ts'
const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
console.log('Middleware exists:', !!middlewareContent)

// Check the app directory structure
console.log('\nChecking app directory structure...')
const appDir = './src/app'
const appFiles = fs.readdirSync(appDir)
console.log('App directory files:', appFiles)

// Check if locale directory exists
const localeDir = './src/app/[locale]'
const localeFiles = fs.readdirSync(localeDir)
console.log('Locale directory files:', localeFiles)

// Check the next.config.js
console.log('\nChecking next.config.js...')
const nextConfigPath = './next.config.js'
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8')
console.log(
  'next-intl plugin imported:',
  nextConfigContent.includes('next-intl/plugin'),
)

console.log(
  '\nDiagnostic complete. Please check for any inconsistencies above.',
)
