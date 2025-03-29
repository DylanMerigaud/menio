#!/usr/bin/env node

/**
 * Script to reset the Prisma migrations
 * This is useful during development when restructuring the migrations approach
 *
 * WARNING: This script will delete ALL migration files!
 *
 * Usage: ts-node reset-migrations.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

// Path to migrations folder
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')

// Confirm operation
console.log('⚠️  WARNING: This will delete all Prisma migration files!')
console.log('Press Ctrl+C to cancel or Enter to continue...')

// Wait for user confirmation
process.stdin.once('data', () => {
  // Check if prisma schema exists
  if (!fs.existsSync(prismaSchemaPath)) {
    console.error('Error: Prisma schema not found at', prismaSchemaPath)
    process.exit(1)
  }

  // Delete migrations directory if it exists
  if (fs.existsSync(migrationsDir)) {
    fs.rmSync(migrationsDir, { recursive: true, force: true })
    console.log('Deleted migrations directory')
  }

  // Reset Prisma migration history
  try {
    console.log('Resetting Prisma migration history...')
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  } catch {
    console.log(
      'Migration reset failed, but we will continue to create a new initial migration',
    )
  }

  // Create a new initial migration
  try {
    console.log('Creating new initial migration...')
    execSync('npx prisma migrate dev --name initial_schema', {
      stdio: 'inherit',
    })
    console.log('Initial migration created successfully!')
  } catch (error) {
    console.error('Failed to create initial migration:', error)
    process.exit(1)
  }

  console.log('Migration reset complete!')
  process.exit(0)
})
