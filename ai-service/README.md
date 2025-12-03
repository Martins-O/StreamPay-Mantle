# AI Risk Service

FastAPI microservice that calculates credit bands for businesses. Use the helper script to get a local virtualenv ready, then run uvicorn.

## Setup

```bash
cd ai-service
cp .env.example .env     # optional overrides consumed by start-services.sh
./setup.sh               # creates .venv and installs requirements
source .venv/bin/activate
```

## Development & tests

```bash
source .venv/bin/activate
uvicorn app:app --reload --port 8001   # or export AI_SERVICE_PORT

# Run FastAPI unit tests
pytest
```

Set `AI_LOG_LEVEL` to `DEBUG` when diagnosing requests. `start-services.sh` automatically uses `.env` to decide the port passed to `uvicorn`.
