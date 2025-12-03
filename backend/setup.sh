#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install backend dependencies." >&2
  exit 1
fi

npm install

echo "Dependencies installed. Copy .env.example to .env and update secrets before running npm run dev."
