#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$ROOT_DIR/.venv"
PYTHON_BIN="${PYTHON_BIN:-python3}"
REQUIREMENTS_FILE="$ROOT_DIR/requirements.txt"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python interpreter '$PYTHON_BIN' not found. Set PYTHON_BIN to your python executable." >&2
  exit 1
fi

if [[ ! -d "$VENV_PATH" ]]; then
  echo "Creating virtualenv in $VENV_PATH"
  "$PYTHON_BIN" -m venv "$VENV_PATH"
else
  echo "Using existing virtualenv at $VENV_PATH"
fi

# shellcheck source=/dev/null
source "$VENV_PATH/bin/activate"

python -m pip install --upgrade pip
python -m pip install -r "$REQUIREMENTS_FILE"

echo "\nVirtualenv ready. Activate it with: source $VENV_PATH/bin/activate"
