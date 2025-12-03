import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { DataStore } from "../src/services/dataStore.ts";
import { RiskService } from "../src/services/riskService.ts";
import type { ScoreBusinessResponse } from "../src/clients/aiClient.ts";
import type { BusinessProfile } from "../src/types/index.ts";
import { ethers } from "ethers";

class FakeAiClient {
  scoreBusiness = vi.fn(async () => ({ score: 72, band: "MEDIUM" } satisfies ScoreBusinessResponse));
}

describe("RiskService", () => {
  it("signs payloads and stores risk data", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "streamyield-test-"));
    const storePath = path.join(tmpDir, "store.json");
    const store = new DataStore(storePath);
    const aiClient = new FakeAiClient();
    const wallet = ethers.Wallet.createRandom();
    const service = new RiskService({ store, aiClient, privateKey: wallet.privateKey });

    const profile: BusinessProfile = {
      address: ethers.Wallet.createRandom().address,
      name: "Acme",
      industry: "SaaS",
      monthlyRevenue: 120_000,
      revenueVolatility: 20,
      contactEmail: "founder@example.com",
      createdAt: Date.now()
    };
    service.upsertBusiness(profile);

    const { record } = await service.evaluateRisk(profile.address, { missedPayments: 1 });
    expect(record.score).toBe(72);
    expect(record.band).toBe("MEDIUM");
    expect(record.signature).toMatch(/^0x/);
    expect(service.getRisk(profile.address)).toMatchObject({ bandIndex: 1 });
  });
});
