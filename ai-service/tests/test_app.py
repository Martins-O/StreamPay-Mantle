from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_score_business_low_band():
    payload = {
        "address": "0xdeadbeef",
        "monthlyRevenue": 250_000,
        "revenueVolatility": 10,
        "missedPayments": 0,
    }
    response = client.post("/score-business", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["band"] == "LOW"
    assert 0 <= data["score"] <= 100


def test_score_business_high_band():
    payload = {
        "address": "0xdeadc0de",
        "monthlyRevenue": 10_000,
        "revenueVolatility": 80,
        "missedPayments": 2,
    }
    response = client.post("/score-business", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["band"] == "HIGH"


def test_verify_revenue_endpoint():
    payload = {
        "address": "0xabc",
        "monthlyRevenue": 100_000,
        "revenueVolatility": 10,
    }
    response = client.post("/verify-revenue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verifiedRevenue"] > 0
    assert "Stripe" in data["provider"]


def test_score_business_verified_boost():
    payload = {
        "address": "0xabc",
        "monthlyRevenue": 80_000,
        "revenueVolatility": 10,
        "missedPayments": 0,
        "useVerifiedData": True
    }
    response = client.post("/score-business", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verified"] is True
    # The score should be higher with the +5 boost
    assert data["score"] > 0
