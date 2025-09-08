import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorHandler } from "./src/presentation/middleware/errorHandler";
import { setupRoutes } from "./src/presentation/routes/router";
import { config } from "./src/infrastructure/config/environment";

const app = express();

// Middlewares
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(
  cors({ origin: config.cors.origin, credentials: config.cors.credentials })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Rutas
setupRoutes(app);

// Error handler
app.use(errorHandler);

export default app;
