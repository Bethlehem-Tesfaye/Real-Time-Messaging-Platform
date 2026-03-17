import { createClient } from "redis";
import { env } from "../config/environments";
import { logger } from "../config/logger";

const buildRedisOptions = () => {
  const url = env.REDIS_URL || "redis://localhost:6379";

  if (env.NODE_ENV === "production") {
    return {
      url,
      socket: {
        tls: true as const
      }
    };
  }

  return { url };
};

export const createRedisConnection = () => createClient(buildRedisOptions());

const redisClient = createRedisConnection();

redisClient.on("error", (err) => logger.error({ err }, "Redis error"));
redisClient.on("connect", () => logger.info("Redis connected"));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
