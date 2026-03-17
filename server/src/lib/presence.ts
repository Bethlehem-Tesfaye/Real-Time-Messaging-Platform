import { logger } from "../config/logger";
import redisClient from "./redisClient";

const ONLINE_USERS_KEY = "online_users";
const getUserConnectionsKey = (userId: string) => `user_connections:${userId}`;

const ensureRedisSetKey = async (key: string) => {
  if (!redisClient.isOpen) {
    return;
  }

  const keyType = await redisClient.type(key);

  if (keyType !== "none" && keyType !== "set") {
    logger.warn(
      { key, keyType },
      "Resetting Redis presence key with wrong type"
    );
    await redisClient.del(key);
  }
};

const logPresenceSnapshot = async (
  action: "online" | "offline",
  userId: string
) => {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    const onlineUsers = await redisClient.sMembers(ONLINE_USERS_KEY);
    logger.info(
      {
        action,
        userId,
        onlineUsers,
        onlineCount: onlineUsers.length
      },
      "Presence snapshot"
    );
  } catch (err) {
    logger.error({ err, action, userId }, "Failed to log presence snapshot");
  }
};

export type PresenceUpdateResult = {
  userId: string;
  connectionCount: number;
  becameOnline: boolean;
  becameOffline: boolean;
};

const defaultPresenceResult = (userId: string): PresenceUpdateResult => ({
  userId,
  connectionCount: 0,
  becameOnline: false,
  becameOffline: false
});

export const markUserOnline = async (
  userId: string,
  socketId: string
): Promise<PresenceUpdateResult> => {
  if (!redisClient.isOpen) {
    return defaultPresenceResult(userId);
  }

  try {
    const userConnectionsKey = getUserConnectionsKey(userId);

    await ensureRedisSetKey(ONLINE_USERS_KEY);
    await ensureRedisSetKey(userConnectionsKey);

    const onlineAddCount = await redisClient.sAdd(ONLINE_USERS_KEY, userId);
    await redisClient.sAdd(userConnectionsKey, socketId);
    const connectionCount = await redisClient.sCard(userConnectionsKey);

    logger.info(
      { userId, socketId, connectionCount },
      "User marked online in Redis"
    );
    await logPresenceSnapshot("online", userId);

    return {
      userId,
      connectionCount,
      becameOnline: onlineAddCount === 1,
      becameOffline: false
    };
  } catch (err) {
    logger.error({ err, userId, socketId }, "Failed to mark user online");
    return defaultPresenceResult(userId);
  }
};

export const markUserOffline = async (
  userId: string,
  socketId: string
): Promise<PresenceUpdateResult> => {
  if (!redisClient.isOpen) {
    return defaultPresenceResult(userId);
  }

  try {
    const userConnectionsKey = getUserConnectionsKey(userId);

    await ensureRedisSetKey(ONLINE_USERS_KEY);
    await ensureRedisSetKey(userConnectionsKey);

    await redisClient.sRem(userConnectionsKey, socketId);
    let connectionCount = await redisClient.sCard(userConnectionsKey);
    let becameOffline = false;

    if (connectionCount <= 0) {
      connectionCount = 0;
      await redisClient.del(userConnectionsKey);
      const removedOnlineUserCount = await redisClient.sRem(
        ONLINE_USERS_KEY,
        userId
      );
      becameOffline = removedOnlineUserCount === 1;
    }

    logger.info(
      { userId, socketId, connectionCount },
      "User marked offline in Redis"
    );
    await logPresenceSnapshot("offline", userId);

    return {
      userId,
      connectionCount,
      becameOnline: false,
      becameOffline
    };
  } catch (err) {
    logger.error({ err, userId, socketId }, "Failed to mark user offline");
    return defaultPresenceResult(userId);
  }
};

export const getOnlineUserIds = async (): Promise<Set<string>> => {
  if (!redisClient.isOpen) {
    return new Set();
  }

  try {
    return new Set(await redisClient.sMembers(ONLINE_USERS_KEY));
  } catch (err) {
    logger.error({ err }, "Failed to read online users from Redis");
    return new Set();
  }
};

export const getOnlineUsersLookup = async (
  userIds: string[]
): Promise<Set<string>> => {
  if (userIds.length === 0) {
    return new Set();
  }

  const onlineUserIds = await getOnlineUserIds();

  return new Set(userIds.filter((userId) => onlineUserIds.has(userId)));
};

export const resetPresenceState = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    const keysToDelete = [ONLINE_USERS_KEY];

    for await (const key of redisClient.scanIterator({
      MATCH: "user_connections:*"
    })) {
      keysToDelete.push(String(key));
    }

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }

    logger.info(
      { clearedKeys: keysToDelete },
      "Reset Redis presence state on startup"
    );
  } catch (err) {
    logger.error({ err }, "Failed to reset Redis presence state on startup");
  }
};
