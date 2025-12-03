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
