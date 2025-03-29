# Project Scripts

This directory contains utility scripts for the Menio project.

## Migration Scripts

### `create-migration.js`

Creates a new SQL migration file with a timestamp prefix.

**Usage:**

```bash
npm run migration:create your_migration_name
```

This creates a file named like `20250329180000_your_migration_name.sql` in the `supabase/migrations` directory.

### `reset-migrations.js`

Resets the migrations folder by deleting all migration files and recreating the initial schema migration.

**WARNING:** This will delete all existing migration files!

**Usage:**

```bash
npm run migration:reset
```

## Other Scripts

Add documentation for other utility scripts here.
