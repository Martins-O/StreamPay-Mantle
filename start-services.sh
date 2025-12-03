#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AI_DIR="$ROOT_DIR/ai-service"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

AI_PORT="${AI_SERVICE_PORT:-8001}"
BACKEND_SCRIPT="${BACKEND_SCRIPT:-npm run dev}"
FRONTEND_SCRIPT="${FRONTEND_SCRIPT:-npm run dev}"

pids=()

cleanup() {
  status=$?
  if ((${#pids[@]})); then
    echo "\nStopping services..."
    for pid in "${pids[@]}"; do
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
    done
  fi
  wait || true
  exit "$status"
}

trap cleanup EXIT INT TERM

start_service() {
  local name="$1"
  local dir="$2"
  shift 2
  echo "Starting $name..."
  (
    cd "$dir"
    "$@"
  ) &
  pids+=("$!")
}

start_ai_service() {
  local uvicorn_bin
  if [[ -x "$AI_DIR/.venv/bin/uvicorn" ]]; then
    uvicorn_bin="$AI_DIR/.venv/bin/uvicorn"
  elif command -v uvicorn >/dev/null 2>&1; then
    uvicorn_bin="$(command -v uvicorn)"
  else
    echo "uvicorn is not installed. Activate your ai-service virtualenv or install uvicorn first." >&2
    exit 1
  fi

  start_service "AI service" "$AI_DIR" "$uvicorn_bin" app:app --reload --port "$AI_PORT"
}

start_backend() {
  IFS=' ' read -r -a cmd <<<"$BACKEND_SCRIPT"
  start_service "Backend API" "$BACKEND_DIR" "${cmd[@]}"
}

start_frontend() {
  IFS=' ' read -r -a cmd <<<"$FRONTEND_SCRIPT"
  start_service "Frontend" "$FRONTEND_DIR" "${cmd[@]}"
}

start_ai_service
start_backend
start_frontend

echo "\nAll services started. Press Ctrl+C to stop."
wait
