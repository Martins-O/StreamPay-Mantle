import { randomBytes } from "node:crypto";
import { ethers } from "ethers";
import { DataStore } from "./dataStore.ts";
import { AiClient, type ScoreBusinessInput, type ScoreBusinessResponse } from "../clients/aiClient.ts";
import type { BusinessProfile, RiskBand, RiskPayload, RiskRecord } from "../types/index.ts";

const abiCoder = ethers.AbiCoder.defaultAbiCoder();
const RISK_TYPEHASH = ethers.keccak256(
  ethers.toUtf8Bytes("RiskPayload(address subject,uint8 score,uint8 band,uint256 timestamp,uint256 expiry,bytes32 nonce)")
);

interface RiskServiceOpts {
  store: DataStore;
  aiClient: AiClient;
  privateKey: string;
}

export class RiskService {
  private readonly signer: ethers.Wallet;

  constructor(private readonly options: RiskServiceOpts) {
    if (!options.privateKey) {
      throw new Error("RISK_SIGNER_PRIVATE_KEY is not configured");
    }
    this.signer = new ethers.Wallet(options.privateKey);
  }

  getBusinesses() {
    return this.options.store.listBusinesses();
  }

  getRisk(address: string) {
    return this.options.store.getRisk(address);
  }

  upsertBusiness(profile: BusinessProfile) {
    this.options.store.upsertBusiness(profile);
  }

  async evaluateRisk(address: string, overrides?: Partial<ScoreBusinessInput>) {
    const business = this.options.store.getBusiness(address);
    const metrics = this.buildMetrics(address, business, overrides);
    const aiResponse = await this.options.aiClient.scoreBusiness(metrics);
    const payload = this.buildPayload(address, aiResponse);
    const signature = await this.signPayload(payload);

    const record: RiskRecord = {
      score: aiResponse.score,
      band: aiResponse.band,
      bandIndex: payload.band,
      lastUpdated: payload.timestamp,
      signature,
      payload
    };
    this.options.store.setRisk(address, record);
    return { record, payload, signature };
  }

  private buildMetrics(
    address: string,
    profile: BusinessProfile | undefined,
    overrides?: Partial<ScoreBusinessInput>
  ): ScoreBusinessInput {
    const defaults = {
      address,
      monthlyRevenue: profile?.monthlyRevenue ?? 50_000,
      revenueVolatility: profile?.revenueVolatility ?? 15,
      missedPayments: 0
    } satisfies ScoreBusinessInput;

    return { ...defaults, ...overrides, address };
  }

  private buildPayload(subject: string, response: ScoreBusinessResponse): RiskPayload {
    const timestamp = Math.floor(Date.now() / 1000);
    return {
      subject,
      score: Math.max(0, Math.min(100, Math.round(response.score))),
      band: this.bandToIndex(response.band),
      timestamp,
      expiry: timestamp + 3600,
      nonce: ethers.hexlify(randomBytes(32))
    };
  }

  private async signPayload(payload: RiskPayload) {
    const encoded = abiCoder.encode(
      ["bytes32", "address", "uint8", "uint8", "uint256", "uint256", "bytes32"],
      [
        RISK_TYPEHASH,
        payload.subject,
        payload.score,
        payload.band,
        payload.timestamp,
        payload.expiry,
        payload.nonce
      ]
    );
    const digest = ethers.keccak256(encoded);
    return this.signer.signMessage(ethers.getBytes(digest));
  }

  private bandToIndex(band: RiskBand) {
    if (band === "LOW") return 0;
    if (band === "MEDIUM") return 1;
    return 2;
  }
}
