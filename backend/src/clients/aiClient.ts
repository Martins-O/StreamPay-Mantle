import type { RiskBand } from "../types/index.ts";

export interface ScoreBusinessInput {
  address: string;
  monthlyRevenue: number;
  revenueVolatility: number;
  missedPayments: number;
}

export interface ScoreBusinessResponse {
  score: number;
  band: RiskBand;
  rationale?: string;
}

export class AiClient {
  constructor(private readonly baseUrl: string) {}

  async scoreBusiness(input: ScoreBusinessInput): Promise<ScoreBusinessResponse> {
    const response = await fetch(`${this.baseUrl}/score-business`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = (await response.json()) as ScoreBusinessResponse;
    return data;
  }
}
