#!/bin/sh
set -e

# Ensure the data directory exists
mkdir -p /app/data

# Run Prisma database push to ensure the schema is up to date in the SQLite volume
echo "Syncing database schema..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting EzyImposter..."
npm run start
