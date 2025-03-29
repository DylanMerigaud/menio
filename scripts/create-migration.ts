#!/usr/bin/env node

/**
 * Creates a new Prisma migration
 *
 * Usage: ts-node create-migration.ts <migration-name>
 * Example: ts-node create-migration.ts add_user_role
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// Check for migration name argument
if (process.argv.length < 3) {
  console.error('Error: Migration name is required')
  console.log('Usage: ts-node create-migration.ts <migration-name>')
  process.exit(1)
}

// Get migration name from command line arguments
const migrationName = process.argv[2].replace(/[^a-z0-9_]/gi, '_').toLowerCase()

// Check if prisma schema exists
const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
if (!fs.existsSync(prismaSchemaPath)) {
  console.error('Error: Prisma schema not found at', prismaSchemaPath)
  process.exit(1)
}

console.log(`Creating migration: ${migrationName}`)
console.log(
  'Note: You should have already updated your Prisma schema with the desired changes.',
)
console.log(
  'This command will create a migration based on the difference between your schema and the database.',
)

try {
  // Create the migration using Prisma
  execSync(`npx prisma migrate dev --name ${migrationName}`, {
    stdio: 'inherit',
  })

  console.log(`Migration "${migrationName}" created successfully!`)
} catch (error) {
  console.error('Failed to create migration:', error)
  process.exit(1)
}
