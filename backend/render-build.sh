#!/usr/bin/env bash
# Render build script with explicit TypeScript and type definitions installation
set -e

echo "==> Installing dependencies..."
npm install

echo "==> Ensuring TypeScript and type definitions are installed..."
# Explicitly install TypeScript and all required type definitions
npm install --save typescript@^5.4.0 @types/node@^20.11.30 @types/express@^4.17.21 @types/cors@^2.8.19

echo "==> Verifying TypeScript installation..."
npx tsc --version

echo "==> Building TypeScript..."
npm run build

echo "==> Build complete!"
