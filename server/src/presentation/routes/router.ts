import { Express } from "express";
import { cryptoRules } from "../controllers/cryptoRules.controller";
import { healthCheck } from "../controllers/healthcheck.controller";
import { fearAndGreed } from "../controllers/fearAndGreed.controller";
import { marketController } from "../controllers/market.controller";

export const setupRoutes = (app: Express): void => {
  app.get("/api/v1/crypto/rules", cryptoRules.getRules);
  app.get("/api/v1/health", healthCheck);
  app.get("/api/v1/crypto/sentiment", fearAndGreed.getIndex);
  app.get("/api/v1/market/capitulation", cryptoRules.getCapitulation);
  app.get("/api/v1/market/newCapitulation", marketController.getMarketMovers);
  app.get("/api/v1/market/top-gainers", marketController.getTopGainers);
  app.get("/api/v1/market/top-losers", marketController.getTopLosers);
  app.get("/api/v1/market/global", marketController.getGlobalMarket);
  app.get("/api/v1/market/btc-dominance", marketController.getBTCDominance);
  app.get("/api/v1/market/:symbol/24h", marketController.get24hData);

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
    });
  });
};
