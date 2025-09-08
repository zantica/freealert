import dotenv from 'dotenv';

// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const requiredEnvVars = [
  'BNB_BASE_URL',
  'COINGECKO_BASE_URL', 
  'FEAR_GREED_BASE_URL'
];

// Validar variables de entorno
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Missing environment variable: ${envVar}`);
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10), // App Engine usa 8080
  cors: {
    origin: process.env.CLIENT_URL || (
      process.env.NODE_ENV === 'production' 
        ? ["https://your-project-id.appspot.com", "https://freealert.web.app"] 
        : "http://localhost:5173"
    ),
    credentials: true,
  },
  apis: {
    binance: {
      baseUrl: process.env.BNB_BASE_URL || "https://api.binance.com/",
    },
    coingecko: {
      baseUrl: process.env.COINGECKO_BASE_URL || "https://api.coingecko.com/api/v3",
    },
    fearGreed: {
      baseUrl: process.env.FEAR_GREED_BASE_URL || "https://api.alternative.me/",
    },
    coinmarketcap: {
      apiKey: process.env.COINMARKETCAP_API_KEY,
    },
  },
};

// Log configuration solo en desarrollo
if (config.env === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${config.env}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   CORS Origin: ${config.cors.origin}`);
  console.log(`   APIs configured: ${Object.keys(config.apis).join(', ')}`);
}