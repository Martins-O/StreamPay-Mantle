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
    useVerifiedData: bool = Field(default=False)


class ScoreBusinessResponse(BaseModel):
    score: int
    band: str
    rationale: str
    verified: bool = False


class VerifyRevenueResponse(BaseModel):
    address: str
    verifiedRevenue: float
    confidence: float
    provider: str


def _band_for_score(score: float) -> str:
    if score >= 75:
        return "LOW"
    if score >= 55:
        return "MEDIUM"
    return "HIGH"


@app.post("/verify-revenue", response_model=VerifyRevenueResponse)
async def verify_revenue(payload: ScoreBusinessRequest):
    """
    Simulates a call to an external financial API (e.g., Stripe/Plaid).
    In a real app, this would use OAuth tokens to fetch actual transaction data.
    """
    logger.info("verify_revenue: simulating external check for address=%s", payload.address)
    # Simulate a slight adjustment from self-reported revenue
    verified_revenue = payload.monthlyRevenue * 0.98 
    return VerifyRevenueResponse(
        address=payload.address,
        verifiedRevenue=verified_revenue,
        confidence=0.95,
        provider="Stripe (Simulated)"
    )


@app.post("/score-business", response_model=ScoreBusinessResponse)
async def score_business(payload: ScoreBusinessRequest):
    revenue = payload.monthlyRevenue
    verification_rationale = ""
    
    if payload.useVerifiedData:
        # Simulations adjust revenue and add a confidence boost to the score
        revenue = payload.monthlyRevenue * 0.98
        verification_rationale = " (Verified via Stripe)"

    base = min(revenue / 1000, 120)
    volatility_penalty = payload.revenueVolatility * 0.4
    missed_penalty = payload.missedPayments * 6
    
    # Give a small 5-point boost for using verified data
    verification_boost = 5 if payload.useVerifiedData else 0
    
    score = max(0.0, min(100.0, base - volatility_penalty - missed_penalty + verification_boost))

    band = _band_for_score(score)
    rationale = (
        f"Revenue-adjusted score {score:.1f} based on ${revenue:,.0f} monthly revenue{verification_rationale},"
        f" volatility {payload.revenueVolatility}% and {payload.missedPayments} missed payments."
    )
    logger.info(
        "score_business: address=%s score=%.2f band=%s volatility=%s missed=%s verified=%s",
        payload.address,
        score,
        band,
        payload.revenueVolatility,
        payload.missedPayments,
        payload.useVerifiedData
    )
    return ScoreBusinessResponse(
        score=int(score), 
        band=band, 
        rationale=rationale, 
        verified=payload.useVerifiedData
    )


@app.get("/health")
async def health():
    return {"ok": True}
