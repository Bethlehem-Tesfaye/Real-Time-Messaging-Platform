import type { Prisma } from "@prisma/client";

export type NotificationType = "message" | "mention" | "room_invite";

export type NotificationData = {
  roomId?: number;
  messageId?: number;
  senderName?: string;
};

export type NotificationItem = {
  id: number;
  type: NotificationType;
  data: Prisma.JsonValue;
  read: boolean;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  data: Prisma.InputJsonValue;
};

export type CreateMessageNotificationsInput = {
  senderId: string;
  senderName: string;
  roomId: number;
  messageId: number;
  content: string;
};

export type ListNotificationsQuery = {
  limit?: string;
  unreadOnly?: string;
};

export type NotificationIdParams = {
  id: string;
};

export type MarkNotificationReadResponse = {
  message: string;
  notification: NotificationItem;
};

export type MarkAllNotificationsReadResponse = {
  message: string;
  updatedCount: number;
};
