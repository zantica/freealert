import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

// Cargar variables de entorno al inicio
dotenv.config();

const app = express();

// Middleware básico
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de health check básica
app.get("/", (req, res) => {
  res.json({
    message: "FreeAlert API is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Importar y configurar rutas después de los middlewares básicos
try {
  const { setupRoutes } = require("./src/presentation/routes/router");
  setupRoutes(app);
} catch (error) {
  console.error("Error loading routes:", error);
  // Continuar sin las rutas personalizadas por ahora
}

// Error handler global
app.use(
  (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Para desarrollo local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Exportar para Vercel
export default app;
