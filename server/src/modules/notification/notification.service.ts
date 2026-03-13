import CustomError from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import redisClient from "../../lib/redisClient";
import type {
  CreateMessageNotificationsInput,
  CreateNotificationInput,
  ListNotificationsQuery,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  NotificationItem
} from "./types";

const normalizeNotificationType = (value: string): NotificationItem["type"] => {
  if (value === "mention" || value === "room_invite") {
    return value;
  }

  return "message";
};

const toNotificationItem = (notification: {
  id: number;
  type: string;
  data: unknown;
  read: boolean;
  createdAt: Date;
}): NotificationItem => ({
  id: notification.id,
  type: normalizeNotificationType(notification.type),
  data: notification.data as NotificationItem["data"],
  read: notification.read,
  createdAt: notification.createdAt.toISOString()
});

const getUserNotificationChannel = (userId: string) =>
  `notifications:${userId}`;

const extractMentionedUsernames = (content: string): Set<string> => {
  const matches = content.matchAll(/@([a-zA-Z0-9_]+)/g);
  const usernames = new Set<string>();

  for (const match of matches) {
    const username = match[1]?.trim().toLowerCase();
    if (username) {
      usernames.add(username);
    }
  }

  return usernames;
};

export const createNotificationService = async (
  payload: CreateNotificationInput
): Promise<NotificationItem> => {
  const createdNotification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      data: payload.data
    }
  });

  const notification = toNotificationItem(createdNotification);

  if (redisClient.isOpen) {
    await redisClient.publish(
      getUserNotificationChannel(payload.userId),
      JSON.stringify(notification)
    );
  }

  return notification;
};

export const createMessageNotificationsService = async (
  payload: CreateMessageNotificationsInput
): Promise<void> => {
  const room = await prisma.room.findUnique({
    where: { id: payload.roomId },
    select: {
      ownerId: true,
      members: {
        select: {
          userId: true,
          user: {
            select: {
              profiles: {
                select: {
                  username: true
                },
                take: 1
              }
            }
          }
        }
      }
    }
  });

  if (!room) {
    return;
  }

  const ownerProfile = await prisma.profile.findUnique({
    where: { userId: room.ownerId },
    select: { username: true }
  });

  const usernameByUserId = new Map<string, string>();
  if (ownerProfile?.username) {
    usernameByUserId.set(room.ownerId, ownerProfile.username.toLowerCase());
  }

  room.members.forEach((member) => {
    const username = member.user.profiles[0]?.username?.toLowerCase();
    if (username) {
      usernameByUserId.set(member.userId, username);
    }
  });

  const participantIds = new Set<string>([
    room.ownerId,
    ...room.members.map((member) => member.userId)
  ]);
  participantIds.delete(payload.senderId);

  const mentionedUsernames = extractMentionedUsernames(payload.content);

  await Promise.all(
    Array.from(participantIds).map(async (recipientId) => {
      const recipientUsername = usernameByUserId.get(recipientId);
      const isMentioned =
        typeof recipientUsername === "string" &&
        mentionedUsernames.has(recipientUsername);

      await createNotificationService({
        userId: recipientId,
        type: isMentioned ? "mention" : "message",
        data: {
          roomId: payload.roomId,
          messageId: payload.messageId,
          senderName: payload.senderName
        }
      });
    })
  );
};

export const listNotificationsService = async (
  userId: string,
  query: ListNotificationsQuery
): Promise<NotificationItem[]> => {
  const limit = query.limit ? Number(query.limit) : 30;
  const safeLimit = Math.min(Math.max(limit, 20), 50);
  const unreadOnly = query.unreadOnly === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {})
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit
  });

  return notifications.map(toNotificationItem);
};

export const markNotificationReadService = async (
  userId: string,
  notificationId: number
): Promise<MarkNotificationReadResponse> => {
  const existingNotification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId
    }
  });

  if (!existingNotification) {
    throw new CustomError("Notification not found", 404);
  }

  const updatedNotification = existingNotification.read
    ? existingNotification
    : await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      });

  return {
    message: "Notification marked as read",
    notification: toNotificationItem(updatedNotification)
  };
};

export const markAllNotificationsReadService = async (
  userId: string
): Promise<MarkAllNotificationsReadResponse> => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false
    },
    data: {
      read: true
    }
  });

  return {
    message: "All notifications marked as read",
    updatedCount: result.count
  };
};
