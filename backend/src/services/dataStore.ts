import fs from "node:fs";
import path from "node:path";
import type { BusinessProfile, PoolMetrics, RiskRecord } from "../types/index.ts";

interface DatabaseState {
  businesses: Record<string, BusinessProfile>;
  risks: Record<string, RiskRecord>;
  pools: Record<string, PoolMetrics>;
}

const DEFAULT_STATE: DatabaseState = {
  businesses: {},
  risks: {},
  pools: {}
};

const ensureDir = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export class DataStore {
  private filePath: string;
  private state: DatabaseState;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    ensureDir(this.filePath);
    this.load();
  }

  private load() {
    if (!fs.existsSync(this.filePath)) {
      this.persist();
      return;
    }

    const raw = fs.readFileSync(this.filePath, "utf-8");
    if (!raw) {
      this.state = { ...DEFAULT_STATE };
      return;
    }

    try {
      this.state = JSON.parse(raw) as DatabaseState;
    } catch (error) {
      console.warn("Failed to parse datastore JSON, resetting", error);
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  private persist() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
  }

  private normalizeAddress(address: string) {
    return address.toLowerCase();
  }

  upsertBusiness(profile: BusinessProfile) {
    const address = this.normalizeAddress(profile.address);
    this.state.businesses[address] = profile;
    this.persist();
  }

  getBusiness(address: string) {
    return this.state.businesses[this.normalizeAddress(address)];
  }

  listBusinesses() {
    return Object.values(this.state.businesses);
  }

  setRisk(address: string, record: RiskRecord) {
    this.state.risks[this.normalizeAddress(address)] = record;
    this.persist();
  }

  getRisk(address: string) {
    return this.state.risks[this.normalizeAddress(address)];
  }

  setPoolMetrics(id: string, metrics: PoolMetrics) {
    this.state.pools[id] = metrics;
    this.persist();
  }

  getPoolMetrics(id: string) {
    return this.state.pools[id];
  }
}
