#!/bin/sh
set -e

echo "🔄 Running database migrations..."
bun --bun drizzle-kit push

echo "🌱 Seeding achievements..."
bun src/seed-achievements.ts

echo "🚀 Starting server..."
exec bun run src/index.ts
