import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { fromNodeHeaders } from "better-auth/node";
import { env } from "./config/environments";
import { logger } from "./config/logger";
import { auth } from "./modules/auth/auth";
import {
  canUserAccessRoom,
  createMessageService
} from "./modules/message/message.service";
import type { NotificationItem } from "./modules/notification/types";
import { createMessageNotificationsService } from "./modules/notification/notification.service";
import type {
  JoinRoomSocketPayload,
  LeaveRoomSocketPayload,
  MessageItem,
  SendMessageSocketPayload,
  SocketAck
} from "./modules/message/types";

type SessionUser = {
  id?: string;
  name?: string;
};

const getRoomChannel = (roomId: number) => `room:${roomId}`;
const getUserChannel = (userId: string) => `user:${userId}`;
let ioInstance: Server | null = null;

export const emitRoomMessage = (roomId: number, message: MessageItem) => {
  ioInstance?.to(getRoomChannel(roomId)).emit("receive_message", message);
};

const initializeRedisAdapter = async (io: Server) => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
  logger.info("Socket.IO Redis adapter connected");
};

const initializeNotificationSubscriber = async (io: Server) => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const subscriberClient = createClient({ url: redisUrl });

  await subscriberClient.connect();

  await subscriberClient.pSubscribe("notifications:*", (message, channel) => {
    const userId = channel.replace("notifications:", "").trim();

    if (!userId) {
      return;
    }

    try {
      const notification = JSON.parse(message) as NotificationItem;
      io.to(getUserChannel(userId)).emit("receive_notification", notification);
    } catch (err) {
      logger.warn({ err }, "Failed to parse notification payload");
    }
  });

  logger.info("Notification Redis subscriber connected");
};

export const registerSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5174"
      ].filter(Boolean),
      credentials: true
    }
  });
  ioInstance = io;

  void initializeRedisAdapter(io).catch((err) => {
    logger.warn(
      { err },
      "Socket.IO Redis adapter unavailable; running single-node"
    );
  });

  void initializeNotificationSubscriber(io).catch((err) => {
    logger.warn(
      { err },
      "Notification Redis subscriber unavailable; realtime notifications disabled"
    );
  });

  io.use(async (socket, next) => {
    try {
      const headers = {
        ...socket.handshake.headers
      } as Record<string, string | string[] | undefined>;

      const tokenFromAuth =
        typeof socket.handshake.auth?.token === "string"
          ? socket.handshake.auth.token
          : undefined;

      if (tokenFromAuth) {
        headers.authorization = `Bearer ${tokenFromAuth}`;
      }

      const session = (await auth.api.getSession({
        headers: fromNodeHeaders(headers)
      })) as { user?: SessionUser } | undefined;

      if (!session?.user?.id) {
        return next(new Error("Unauthorized socket connection"));
      }

      socket.data.userId = session.user.id;
      socket.data.userName = session.user.name ?? "Unknown";

      return next();
    } catch (err) {
      logger.error({ err }, "Socket authentication failed");
      return next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(getUserChannel(socket.data.userId));

    logger.info(
      { socketId: socket.id, userId: socket.data.userId },
      "Socket connected"
    );

    socket.on(
      "join_room",
      async (
        payload: JoinRoomSocketPayload,
        ack?: (response: SocketAck) => void
      ) => {
        try {
          const roomId = Number(payload?.roomId);
          if (!Number.isInteger(roomId) || roomId <= 0) {
            ack?.({ ok: false, message: "Invalid room id" });
            return;
          }

          const canAccessRoom = await canUserAccessRoom(
            socket.data.userId,
            roomId
          );
          if (!canAccessRoom) {
            ack?.({ ok: false, message: "You are not a member of this room" });
            return;
          }

          await socket.join(getRoomChannel(roomId));
          ack?.({ ok: true });
        } catch (err) {
          logger.error({ err }, "join_room failed");
          ack?.({ ok: false, message: "Failed to join room" });
        }
      }
    );

    socket.on(
      "leave_room",
      async (
        payload: LeaveRoomSocketPayload,
        ack?: (response: SocketAck) => void
      ) => {
        try {
          const roomId = Number(payload?.roomId);
          if (!Number.isInteger(roomId) || roomId <= 0) {
            ack?.({ ok: false, message: "Invalid room id" });
            return;
          }

          await socket.leave(getRoomChannel(roomId));
          ack?.({ ok: true });
        } catch (err) {
          logger.error({ err }, "leave_room failed");
          ack?.({ ok: false, message: "Failed to leave room channel" });
        }
      }
    );

    socket.on(
      "send_message",
      async (
        payload: SendMessageSocketPayload,
        ack?: (response: SocketAck) => void
      ) => {
        try {
          const roomId = Number(payload?.roomId);
          const content =
            typeof payload?.content === "string" ? payload.content : "";

          if (!Number.isInteger(roomId) || roomId <= 0) {
            ack?.({ ok: false, message: "Invalid room id" });
            return;
          }

          const createdMessage = await createMessageService(
            socket.data.userId,
            roomId,
            content
          );

          await createMessageNotificationsService({
            senderId: createdMessage.senderId,
            senderName: createdMessage.senderName,
            roomId: createdMessage.roomId,
            messageId: createdMessage.id,
            content: createdMessage.content
          });

          io.to(getRoomChannel(roomId)).emit("receive_message", createdMessage);
          ack?.({ ok: true });
        } catch (err) {
          logger.error({ err }, "send_message failed");
          ack?.({ ok: false, message: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {
      logger.info(
        { socketId: socket.id, userId: socket.data.userId },
        "Socket disconnected"
      );
    });
  });

  return io;
};
