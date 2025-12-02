import fs from "node:fs";
import { Router } from "express";
import type { PoolConfig, PoolMetrics } from "../types/index.ts";
import type { RiskService } from "../services/riskService.ts";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const loadPools = (filePath: string): PoolConfig[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw) return [];
  return JSON.parse(raw) as PoolConfig[];
};

const deriveMetrics = (pool: PoolConfig, riskService: RiskService): PoolMetrics => {
  const risk = riskService.getRisk(pool.revenueToken) ?? null;
  const baseScore = risk?.score ?? 55;
  const tvl = Math.round(baseScore * 4_000);
  const apy = Number((pool.targetApy * (baseScore / 60)).toFixed(4));
  const investors = Math.max(3, Math.round(baseScore / 10));

  return {
    id: pool.id,
    name: pool.name,
    symbol: pool.symbol,
    tvl,
    apy,
    investors,
    risk
  };
};

export const createPoolRouter = (registryPath: string, riskService: RiskService) => {
  const router = Router();
  let pools = loadPools(registryPath);

  router.get(
    "/",
    asyncHandler((_, res) => {
      pools = pools.length ? pools : loadPools(registryPath);
      const snapshot = pools.map((pool) => ({ ...pool, metrics: deriveMetrics(pool, riskService) }));
      res.json(snapshot);
    })
  );

  router.get(
    "/:id/metrics",
    asyncHandler((req, res) => {
      pools = pools.length ? pools : loadPools(registryPath);
      const pool = pools.find((p) => p.id === req.params.id);
      if (!pool) {
        return res.status(404).json({ message: "Pool not found" });
      }
      res.json(deriveMetrics(pool, riskService));
    })
  );

  return router;
};
