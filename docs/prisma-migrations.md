# Prisma Migration Guide

This guide explains how to use Prisma for managing database migrations in the Menio project.

## Setting Up

1. **Initialize Prisma** (already done for this project):

   ```bash
   npx prisma init
   ```

2. **Connect to your Neon PostgreSQL database**:

   Update your `.env` file with the connection string:

   ```
   DATABASE_URL="postgresql://username:password@your-neon-db-hostname:5432/database?sslmode=require"
   ```

3. **Push your schema to the database for development**:
   ```bash
   npx prisma db push
   ```

## Working with Migrations

### The Migration Workflow

1. **Update your Prisma schema** in `prisma/schema.prisma`

2. **Generate a new migration**:

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

   This command:

   - Generates a new migration file based on schema changes
   - Applies the migration to your development database
   - Regenerates the Prisma client

3. **Verify the migration** file in `prisma/migrations/`

4. **Apply migrations in production**:
   ```bash
   npx prisma migrate deploy
   ```

### Creating Enum Types

1. Define the enum in your Prisma schema:

   ```prisma
   enum MyEnumType {
     VALUE1
     VALUE2
     VALUE3
   }
   ```

2. Use the enum in a model:

   ```prisma
   model MyTable {
     id     String     @id @default(uuid())
     status MyEnumType @default(VALUE1)
   }
   ```

3. Generate a migration:
   ```bash
   npx prisma migrate dev --name add_enum_type
   ```

### Checking Database Status

To check if your local schema matches the database:

```bash
npx prisma migrate status
```

### Working with Database in Development

For quick iterations during development:

```bash
# Push schema changes without migrations (for development only)
npx prisma db push

# Reset the database (caution: deletes all data)
npx prisma migrate reset
```

## Common Tasks

### Adding a Field

Update your schema:

```prisma
model Restaurant {
  id          String  @id @default(uuid())
  name        String
  description String?
  newField    String? // New field added
}
```

Then generate a migration:

```bash
npx prisma migrate dev --name add_restaurant_new_field
```

### Adding Relations

```prisma
model Owner {
  id           String       @id
  restaurants  Restaurant[]
}

model Restaurant {
  id       String @id @default(uuid())
  ownerId  String
  owner    Owner  @relation(fields: [ownerId], references: [id])

  @@index([ownerId])
}
```

### Adding Indexes

Add indexes directly in your schema:

```prisma
model Restaurant {
  id   String @id @default(uuid())
  slug String @unique
  name String

  @@index([name])
}
```

### Seeding the Database

1. Create a seed file at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create seed data
  await prisma.owner.create({
    data: {
      id: 'test-owner',
      email: 'test@example.com',
      restaurants: {
        create: {
          name: 'Test Restaurant',
          slug: 'test-restaurant',
          address: '123 Test St',
          // Add other required fields
        },
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

2. Run the seed:

```bash
npx prisma db seed
```

3. Add this to your package.json:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## Best Practices

1. **One Change Per Migration**: Each migration should represent a single logical change
2. **Version Control Your Schema**: Always commit schema changes with the corresponding migrations
3. **Use Models for Type Safety**: Let Prisma generate type-safe client based on your schema
4. **Include Comments**: Add comments to your schema to explain models and fields
5. **Validate Migrations**: Always verify generated migrations before applying them
6. **Test Thoroughly**: Test migrations locally before applying them to production
7. **Use Transactions**: Prisma migrations are automatically wrapped in transactions
8. **Keep Your Client Updated**: Run `npx prisma generate` after schema changes to update your client

### Custom SQL in Migrations

For complex migrations, you can include raw SQL:

1. Generate a migration:

   ```bash
   npx prisma migrate dev --name complex_migration --create-only
   ```

2. Edit the generated SQL file in `prisma/migrations/[timestamp]_complex_migration/migration.sql`

3. Apply the migration:
   ```bash
   npx prisma migrate dev
   ```

## Utility Commands

```bash
# Generate Prisma client
npx prisma generate

# Open Prisma Studio (web UI for your database)
npx prisma studio

# Format your schema file
npx prisma format
```
