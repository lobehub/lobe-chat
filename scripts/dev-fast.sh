#!/bin/bash
# Fast dev script with optimizations

# Clear Next.js cache for fresh start
echo "🧹 Clearing .next cache..."
rm -rf .next

# Set Node options for better performance
export NODE_OPTIONS="--max-old-space-size=4096"

# Start dev server with Turbopack
echo "🚀 Starting dev server with optimizations..."
bun run dev

