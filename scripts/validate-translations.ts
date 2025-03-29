#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Paths to translation files
const EN_MESSAGES_PATH = path.join(process.cwd(), 'src/messages/en.json')
const FR_MESSAGES_PATH = path.join(process.cwd(), 'src/messages/fr.json')
const OUTPUT_PATH = path.join(process.cwd(), 'src/generated/i18n.ts')

// Create a type for translation message objects (recursive)
type MessageObject = {
  [key: string]: string | MessageObject
}

// Load the JSON files
const enMessages = JSON.parse(
  fs.readFileSync(EN_MESSAGES_PATH, 'utf8'),
) as MessageObject
const frMessages = JSON.parse(
  fs.readFileSync(FR_MESSAGES_PATH, 'utf8'),
) as MessageObject

// Function to extract all keys from a nested object (with dot notation)
function extractKeys(obj: MessageObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object') {
      return extractKeys(value, currentKey)
    }
    return [currentKey]
  })
}

// Get all keys from both files
const enKeys = extractKeys(enMessages)
const frKeys = extractKeys(frMessages)

// Find keys that are in one file but not the other
const missingInFr = enKeys.filter((key) => !frKeys.includes(key))
const missingInEn = frKeys.filter((key) => !enKeys.includes(key))

// Check if there are any missing keys
const hasMissingKeys = missingInFr.length > 0 || missingInEn.length > 0

// Output results
if (hasMissingKeys) {
  console.error(chalk.red.bold('❌ Translation validation failed:'))

  if (missingInFr.length > 0) {
    console.error(chalk.yellow('\nMissing in French (fr.json):'))
    missingInFr.forEach((key) => console.error(` - ${key}`))
  }

  if (missingInEn.length > 0) {
    console.error(chalk.yellow('\nMissing in English (en.json):'))
    missingInEn.forEach((key) => console.error(` - ${key}`))
  }

  process.exit(1)
} else {
  console.log(
    chalk.green(
      '✅ All translations are valid! English and French files have matching keys.',
    ),
  )
}

// Function to generate TypeScript types from translation keys
function generateTypeDefinition() {
  // Get all normalized keys
  const uniqueKeys = new Set([...enKeys, ...frKeys])
  const allKeys = Array.from(uniqueKeys).sort()

  // Create namespaces and nested structure for type generation
  const namespaces: Record<string, string[]> = {}

  allKeys.forEach((key: string) => {
    const parts = key.split('.')
    const namespace = parts[0]

    if (!namespaces[namespace]) {
      namespaces[namespace] = []
    }

    // Keep the sub-key path (everything after the first part)
    if (parts.length > 1) {
      namespaces[namespace].push(parts.slice(1).join('.'))
    }
  })

  // Create TypeScript definitions
  const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated from English and French translation files

/**
 * Type-safe translation namespace keys
 */
export type TranslationNamespace = ${Object.keys(namespaces)
    .map((ns) => `'${ns}'`)
    .join(' | ')};

/**
 * Type for the t function from useTranslations()
 */
export type TranslationFunction = {
${Object.entries(namespaces)
  .map(([namespace, keys]) => {
    const keyTypes = keys.map((key) => `  '${key}': string;`).join('\n')
    return `  (key: '${namespace}', defaultValue?: never): {\n${keyTypes}\n  };`
  })
  .join('\n')}
};

/**
 * All available translation keys with dot notation
 */
export type TranslationKey = ${allKeys.map((key) => `'${key}'`).join(' | ')};
`

  fs.writeFileSync(OUTPUT_PATH, tsContent)
  console.log(
    chalk.blue(`✨ Generated TypeScript definitions at ${OUTPUT_PATH}`),
  )
}

// Generate TypeScript types
generateTypeDefinition()
