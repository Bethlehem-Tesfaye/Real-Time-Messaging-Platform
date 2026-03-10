import "dotenv/config";
import "./lib/cloudinary";
import app from "./config/app";
import { logger } from "./config/logger";
import { env } from "./config/environments";
import conn from "./config/db";
import { connectRedis } from "./lib/redisClient";

const PORT = Number(env.PORT) || 5000;

const startServer = async () => {
  try {
    await conn.query("SELECT 1");
    logger.info("database connected");

    await connectRedis();
    logger.info("redis connected");

    app.listen(PORT, () => {
      logger.info(`Server running on port:${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "server startup failed");
  }
};

void startServer();
