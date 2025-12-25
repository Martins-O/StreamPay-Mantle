#!/usr/bin/env bash
# Render build script with fallback TypeScript installation
set -e

echo "==> Installing dependencies..."
npm install

# Ensure TypeScript is available for build
if ! command -v tsc &> /dev/null; then
    echo "==> TypeScript not found, installing explicitly..."
    npm install --save typescript@^5.4.0
fi

echo "==> Building TypeScript..."
npm run build

echo "==> Build complete!"
