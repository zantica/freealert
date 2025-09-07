import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'BNB_BASE_URL',
  'COINGECKO_BASE_URL', 
  'FEAR_GREED_BASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  apis: {
    binance: {
      baseUrl: process.env.BNB_BASE_URL!,
    },
    coingecko: {
      baseUrl: process.env.COINGECKO_BASE_URL!,
    },
    fearGreed: {
      baseUrl: process.env.FEAR_GREED_BASE_URL!,
    },
  },
};

// Log configuration in development
if (config.env === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`   Environment: ${config.env}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   CORS Origin: ${config.cors.origin}`);
  console.log(`   APIs configured: ${Object.keys(config.apis).join(', ')}`);
}