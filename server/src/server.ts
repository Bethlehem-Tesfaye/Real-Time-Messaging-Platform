import "dotenv/config";
import "./lib/cloudinary";
import { createServer } from "http";
import app from "./app";
import { logger } from "./config/logger";
import { env } from "./config/environments";
import conn from "./config/db";
import { connectRedis } from "./lib/redisClient";
import { resetPresenceState } from "./lib/presence";
import { registerSocketServer } from "./socket";

const PORT = Number(env.PORT) || 5000;

const startServer = async () => {
  try {
    await conn.query("SELECT 1");
    logger.info("database connected");

    await connectRedis();
    logger.info("redis connected");

    await resetPresenceState();

    const httpServer = createServer(app);
    registerSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port:${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "server startup failed");
  }
};

startServer();
