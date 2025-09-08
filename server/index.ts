import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorHandler } from "./src/presentation/middleware/errorHandler";
import { setupRoutes } from "./src/presentation/routes/router";
import { config } from "./src/infrastructure/config/environment";

const app = express();

// Middleware de seguridad y optimización
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check para App Engine
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    service: 'freealert-api'
  });
});

// Configurar rutas
setupRoutes(app);

// Error handler
app.use(errorHandler);

// Puerto para App Engine (usa PORT o 8080 por defecto)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
