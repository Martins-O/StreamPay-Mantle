import express from "express";
import { config } from "./config.ts";
import { logger } from "./utils/logger.ts";
import { DataStore } from "./services/dataStore.ts";
import { AiClient } from "./clients/aiClient.ts";
import { RiskService } from "./services/riskService.ts";
import { createBusinessRouter } from "./routes/business.ts";
import { createPoolRouter } from "./routes/pools.ts";

const start = () => {
  try {
    const store = new DataStore(config.dataPath);
    const aiClient = new AiClient(config.aiServiceUrl);
    const riskService = new RiskService({ store, aiClient, privateKey: config.riskSignerPrivateKey });

    const app = express();
    app.use(express.json());

    app.get("/health", (_, res) => {
      res.json({ ok: true, time: Date.now() });
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
