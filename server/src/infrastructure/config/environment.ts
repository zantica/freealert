import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
  apis: {
    binance: {
      baseUrl: process.env.BNB_BASE_URL,
    },
    coingecko: {
      baseUrl: process.env.COINGECKO_BASE_URL,
    },
    fearGreed: {
      baseUrl: process.env.FEAR_GREED_BASE_URL,
    },
  },
};