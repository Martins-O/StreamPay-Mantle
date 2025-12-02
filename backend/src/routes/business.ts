import { Router } from "express";
import { z } from "zod";
import type { RiskService } from "../services/riskService.ts";
import type { BusinessProfile } from "../types/index.ts";

const registerSchema = z.object({
  address: z.string().min(1),
  name: z.string().min(2),
  industry: z.string().min(2),
  monthlyRevenue: z.number().positive(),
  revenueVolatility: z.number().min(0).max(100),
  contactEmail: z.string().email()
});

const riskOverrideSchema = z.object({
  monthlyRevenue: z.number().positive().optional(),
  revenueVolatility: z.number().min(0).max(100).optional(),
  missedPayments: z.number().min(0).optional()
});

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createBusinessRouter = (riskService: RiskService) => {
  const router = Router();

  router.post(
    "/register",
    asyncHandler((req, res) => {
      const payload = registerSchema.parse(req.body);
      const profile: BusinessProfile = {
        ...payload,
        address: payload.address.toLowerCase(),
        createdAt: Date.now()
      };
      riskService.upsertBusiness(profile);
      res.json({ ok: true, profile });
    })
  );

  router.get(
    "/:address/risk",
    asyncHandler((req, res) => {
      const risk = riskService.getRisk(req.params.address);
      if (!risk) {
        return res.status(404).json({ message: "Risk data not found" });
      }
      res.json(risk);
    })
  );

  router.post(
    "/:address/risk",
    asyncHandler(async (req, res) => {
      const overrides = riskOverrideSchema.parse(req.body ?? {});
      const result = await riskService.evaluateRisk(req.params.address, overrides);
      res.json(result);
    })
  );

  router.get(
    "/:address",
    asyncHandler((req, res) => {
      const profile = riskService.getBusinesses().find((b) => b.address === req.params.address.toLowerCase());
      if (!profile) {
        return res.status(404).json({ message: "Business not registered" });
      }
      res.json(profile);
    })
  );

  return router;
};
