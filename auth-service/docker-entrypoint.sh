#!/bin/sh
set -e

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running migrations..."
npx prisma migrate deploy || {
  echo "⚠️  No migrations found, using db push..."
  npx prisma db push --skip-generate --accept-data-loss
}

echo "🚀 Starting application..."
exec npm run start:prod