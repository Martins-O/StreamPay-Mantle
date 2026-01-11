import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { DataStore } from "./services/dataStore.js";
import { AiClient } from "./clients/aiClient.js";
import { RiskService } from "./services/riskService.js";
import { initializeKeeper } from "./services/streamKeeper.js";
import { createBusinessRouter } from "./routes/business.js";
import { createPoolRouter } from "./routes/pools.js";
import streamsRouter from "./routes/streams.js";

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
    app.use("/api/streams", streamsRouter);

    // Initialize stream keeper (auto-claims completed streams)
    if (process.env.ENABLE_STREAM_KEEPER === 'true') {
      const mantleRpcUrl = process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz';
      const streamManagerAddress = process.env.STREAM_MANAGER_ADDRESS || '0x60bd590bc841D8558B279F064459a91Afd0d6015';

      logger.info('Initializing stream keeper service...');
      initializeKeeper(mantleRpcUrl, config.riskSignerPrivateKey, streamManagerAddress, true);
      logger.info('Stream keeper service started - auto-claiming every 60 seconds');
    } else {
      logger.info('Stream keeper disabled (set ENABLE_STREAM_KEEPER=true to enable)');
    }

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
