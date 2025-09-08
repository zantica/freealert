import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorHandler } from "./src/presentation/middleware/errorHandler";
import { setupRoutes } from "./src/presentation/routes/router";
import { config } from "./src/infrastructure/config/environment";

const app = express();

// Middleware de seguridad y optimización ANTES de las rutas
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin, // Usa la configuración del environment
    credentials: config.cors.credentials,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rutas DESPUÉS de los middlewares
setupRoutes(app);

// Error handler al final
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Para Vercel, no necesitamos app.listen en producción
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Exportar la app para Vercel
export default app;

// Graceful shutdown solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    process.exit(0);
  });
}
