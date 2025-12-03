export type RiskBand = "LOW" | "MEDIUM" | "HIGH";

export interface BusinessProfile {
  address: string;
  name: string;
  industry: string;
  monthlyRevenue: number;
  revenueVolatility: number;
  contactEmail: string;
  createdAt: number;
}

export interface RiskPayload {
  subject: string;
  score: number;
  band: number;
  timestamp: number;
  expiry: number;
  nonce: string;
}

export interface RiskRecord {
  score: number;
  band: RiskBand;
  bandIndex: number;
  lastUpdated: number;
  signature: string;
  rationale?: string;
  payload: RiskPayload;
}

export interface PoolConfig {
  id: string;
  name: string;
  symbol: string;
  baseToken: string;
  revenueToken: string;
  yieldPool: string;
  business: string;
  tenorDays: number;
  targetApy: number;
}

export interface PoolMetrics {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
  apy: number;
  investors: number;
  risk: RiskRecord | null;
}
