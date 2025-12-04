#!/bin/sh
set -e

echo "🚀 Starting deployment script..."

echo "📦 Running migrations..."
bun run db:migrate

echo "🌱 Seeding achievements..."
bun run db:seed:achievements

echo "🔥 Starting server..."
exec bun run src/index.ts
