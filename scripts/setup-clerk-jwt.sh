#!/bin/bash

# Script to configure Supabase with Clerk JWT JWKS URL
# This script configures the local Supabase instance to use Clerk's JWKS URL for JWT verification

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Error: .env.local file not found."
  echo "Please create a .env.local file with CLERK_JWT_SUPABASE_JWKS_URL defined."
  exit 1
fi

# Source the environment variables
source .env.local

# Check if CLERK_JWT_SUPABASE_JWKS_URL is defined
if [ -z "$CLERK_JWT_SUPABASE_JWKS_URL" ]; then
  echo "Error: CLERK_JWT_SUPABASE_JWKS_URL is not defined in .env.local."
  echo "Please add the Clerk JWKS URL to your .env.local file."
  exit 1
fi

echo "Setting up Supabase JWT configuration for Clerk..."

# Set the Supabase JWT secret to use the Clerk JWKS URL
supabase secrets set --env-file .env.local SUPABASE_AUTH_JWT_SECRET=$(cat <<EOF
{
  "jwks_url": "${CLERK_JWT_SUPABASE_JWKS_URL}"
}
EOF
)

echo "Restarting Supabase..."
supabase stop && supabase start

echo "✅ Supabase is now configured to use Clerk for JWT verification."
echo "JWKS URL: $CLERK_JWT_SUPABASE_JWKS_URL"