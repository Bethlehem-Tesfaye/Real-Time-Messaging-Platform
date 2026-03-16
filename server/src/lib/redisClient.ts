import { createClient } from "redis";
import { logger } from "../config/logger";

const isProduction = process.env.NODE_ENV === "production";
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ...(isProduction ? { tls: {} } : {})
});

redisClient.on("error", (err) => logger.error({ err }, "Redis error"));
redisClient.on("connect", () => logger.info("Redis connected"));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
