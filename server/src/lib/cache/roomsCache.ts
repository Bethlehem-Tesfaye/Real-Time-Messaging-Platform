import redisClient from "../redisClient";
import { logger } from "../../config/logger";
import { CACHE_KEYS } from "../../config/cache";

export const invalidateRoomsListCache = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.del(CACHE_KEYS.ROOMS_LIST);
    }
  } catch (err) {
    logger.error({ err }, "Failed to invalidate room list cache");
  }
};
