import { BACKEND_BASE_URL } from './streamYield';

export interface BusinessRegistrationPayload {
  address: string;
  name: string;
  industry: string;
  monthlyRevenue: number;
  revenueVolatility: number;
  contactEmail: string;
}

export interface RiskResponse {
  score: number;
  band: 'LOW' | 'MEDIUM' | 'HIGH';
  bandIndex: number;
  lastUpdated: number;
  signature?: string;
  rationale?: string;
}

export interface PoolResponse {
  id: string;
  name: string;
  symbol: string;
  baseToken: string;
  revenueToken: string;
  yieldPool: string;
  business: string;
  tenorDays: number;
  targetApy: number;
  metrics: {
    apy: number;
    tvl: number;
    investors: number;
    risk: RiskResponse | null;
  };
}

export interface BackendConfigResponse {
  riskOracleAddress: string;
  aiServiceUrl: string;
  poolRegistryPath: string;
}

const baseUrl = BACKEND_BASE_URL.replace(/\/$/, '');

const request = async <T>(path: string, opts?: RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    ...opts,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const registerBusiness = (payload: BusinessRegistrationPayload) =>
  request<{ ok: boolean; profile: BusinessRegistrationPayload & { createdAt: number } }>(
    '/api/business/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

export const fetchBusinessProfile = (address: string) =>
  request<BusinessRegistrationPayload & { createdAt: number }>(`/api/business/${address}`);

export const fetchRisk = (address: string) => request<RiskResponse>(`/api/business/${address}/risk`);

export const refreshRisk = (address: string, overrides: Partial<{ monthlyRevenue: number; revenueVolatility: number; missedPayments: number }>) =>
  request<{ record: RiskResponse }>(`/api/business/${address}/risk`, {
    method: 'POST',
    body: JSON.stringify(overrides ?? {}),
  });

export const fetchPools = () => request<PoolResponse[]>(`/api/pools`);

export const fetchPoolMetrics = (id: string) => request<PoolResponse['metrics']>(`/api/pools/${id}/metrics`);

export const fetchBackendConfig = () => request<BackendConfigResponse>('/api/config');
