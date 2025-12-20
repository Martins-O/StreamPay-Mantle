import { randomBytes } from "node:crypto";
import { ethers } from "ethers";
import { DataStore } from "./dataStore.js";
import { AiClient, type ScoreBusinessInput, type ScoreBusinessResponse } from "../clients/aiClient.js";
import type { BusinessProfile, RiskBand, RiskPayload, RiskRecord } from "../types/index.js";

const DOMAIN_NAME = "StreamYieldRisk";
const DOMAIN_VERSION = "1";
const RISK_TYPES = {
  RiskPayload: [
    { name: "subject", type: "address" },
    { name: "score", type: "uint8" },
    { name: "band", type: "uint8" },
    { name: "timestamp", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "nonce", type: "bytes32" }
  ]
} as const;

interface RiskServiceOpts {
  store: DataStore;
  aiClient: AiClient;
  privateKey: string;
  verifyingContract: string;
  chainId: number;
}

const PRIVATE_KEY_REGEX = /^0x[a-fA-F0-9]{64}$/;

export class RiskService {
  private readonly signer: ethers.Wallet;
  private readonly domain: ethers.TypedDataDomain;

  constructor(private readonly options: RiskServiceOpts) {
    this.ensurePrivateKey(options.privateKey);
    this.ensureOracleConfig(options.verifyingContract, options.chainId);
    this.signer = new ethers.Wallet(options.privateKey);
    this.domain = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      verifyingContract: ethers.getAddress(options.verifyingContract),
      chainId: options.chainId
    } satisfies ethers.TypedDataDomain;
  }

  private ensurePrivateKey(key: string) {
    if (!key) {
      throw new Error("RISK_SIGNER_PRIVATE_KEY is not configured");
    }
    if (!PRIVATE_KEY_REGEX.test(key)) {
      throw new Error("RISK_SIGNER_PRIVATE_KEY must be a 32-byte hex string (0x...) with no ellipses or placeholders");
    }
  }

  private ensureOracleConfig(address: string, chainId: number) {
    if (!ethers.isAddress(address)) {
      throw new Error("RISK_ORACLE_ADDRESS must be a valid address");
    }
    if (!chainId || Number.isNaN(chainId)) {
      throw new Error("RISK_ORACLE_CHAIN_ID must be provided");
    }
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
      rationale: aiResponse.rationale,
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
    return this.signer.signTypedData(this.domain, RISK_TYPES, payload as Record<string, any>);
  }

  private bandToIndex(band: RiskBand) {
    if (band === "LOW") return 0;
    if (band === "MEDIUM") return 1;
    return 2;
  }
}
