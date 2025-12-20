import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { DataStore } from "./services/dataStore.js";
import { AiClient } from "./clients/aiClient.js";
import { RiskService } from "./services/riskService.js";
import { createBusinessRouter } from "./routes/business.js";
import { createPoolRouter } from "./routes/pools.js";

const start = () => {
  try {
    const store = new DataStore(config.dataPath);
    const aiClient = new AiClient(config.aiServiceUrl);
    const riskService = new RiskService({
      store,
      aiClient,
      privateKey: config.riskSignerPrivateKey,
      verifyingContract: config.riskOracleAddress,
      chainId: config.riskOracleChainId
    });

    const app = express();
    app.use(
      cors({
        origin: config.allowedOrigins,
        credentials: true
      })
    );
    app.use(express.json());

    app.get("/health", (_, res) => {
      res.json({ ok: true, time: Date.now() });
    });

    app.get("/api/config", (_, res) => {
      res.json({
        riskOracleAddress: config.riskOracleAddress,
        aiServiceUrl: config.aiServiceUrl,
        poolRegistryPath: config.poolRegistryPath
      });
    });

    app.use("/api/business", createBusinessRouter(riskService));
    app.use("/api/pools", createPoolRouter(config.poolRegistryPath, riskService));

    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error({ err }, "Unhandled error");
      res.status(500).json({ message: "Internal Server Error" });
    });

    app.listen(config.port, () => {
      logger.info(`Mantle StreamYield backend listening on :${config.port}`);
    });
  } catch (err) {
    logger.error({ err }, "Unable to start backend");
    process.exit(1);
  }
};

start();
