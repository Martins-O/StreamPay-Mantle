#!/usr/bin/env bash
# Fix dependencies for Render deployment
# Moves TypeScript and type definitions to production dependencies

echo "📦 Moving TypeScript to production dependencies for Render..."

cd "$(dirname "$0")"

# Install TypeScript and types as production dependencies
npm install --save typescript @types/node @types/express @types/cors

echo "✅ Done! TypeScript is now in dependencies."
echo ""
echo "Verify with: grep -A10 'dependencies' package.json"
echo ""
echo "Next steps:"
echo "  1. git add package.json package-lock.json"
echo "  2. git commit -m 'fix: move TypeScript to dependencies for Render deployment'"
echo "  3. git push"
echo "  4. Render will auto-deploy with the changes"
