import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorHandler } from "./src/presentation/middleware/errorHandler";
import { setupRoutes } from "./src/presentation/routes/router";
import { config } from "./src/infrastructure/config/environment";

const app = express();

// Middleware de seguridad y optimización ANTES de las rutas
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Para Vercel
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

// Health check básico
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Configurar rutas DESPUÉS de los middlewares
setupRoutes(app);

// Error handler al final
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Exportar la app para Vercel
export default app;

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
