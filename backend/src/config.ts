import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

export interface AppConfig {
  port: number;
  aiServiceUrl: string;
  riskSignerPrivateKey: string;
  riskOracleAddress: string;
  poolRegistryPath: string;
  dataPath: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8001",
  riskSignerPrivateKey: process.env.RISK_SIGNER_PRIVATE_KEY ?? "",
  riskOracleAddress: process.env.RISK_ORACLE_ADDRESS ?? "",
  poolRegistryPath: process.env.YIELD_POOL_REGISTRY ?? path.join(rootDir, "config/pools.local.json"),
  dataPath: path.join(rootDir, "data/store.json")
};
