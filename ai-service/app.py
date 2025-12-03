import logging
import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Mantle StreamYield AI Risk Service")

logging.basicConfig(level=os.environ.get("AI_LOG_LEVEL", "INFO"))
logger = logging.getLogger("ai-service")


class ScoreBusinessRequest(BaseModel):
    address: str
    monthlyRevenue: float = Field(ge=0)
    revenueVolatility: float = Field(ge=0, le=100)
    missedPayments: int = Field(default=0, ge=0)


class ScoreBusinessResponse(BaseModel):
    score: int
    band: str
    rationale: str


def _band_for_score(score: float) -> str:
    if score >= 75:
        return "LOW"
    if score >= 55:
        return "MEDIUM"
    return "HIGH"


@app.post("/score-business", response_model=ScoreBusinessResponse)
async def score_business(payload: ScoreBusinessRequest):
    base = min(payload.monthlyRevenue / 1000, 120)
    volatility_penalty = payload.revenueVolatility * 0.4
    missed_penalty = payload.missedPayments * 6
    score = max(0.0, min(100.0, base - volatility_penalty - missed_penalty))

    band = _band_for_score(score)
    rationale = (
        f"Revenue-adjusted score {score:.1f} based on ${payload.monthlyRevenue:,.0f} monthly revenue,"
        f" volatility {payload.revenueVolatility}% and {payload.missedPayments} missed payments."
    )
    logger.info(
        "score_business: address=%s score=%.2f band=%s volatility=%s missed=%s",
        payload.address,
        score,
        band,
        payload.revenueVolatility,
        payload.missedPayments
    )
    return ScoreBusinessResponse(score=int(score), band=band, rationale=rationale)


@app.get("/health")
async def health():
    return {"ok": True}
