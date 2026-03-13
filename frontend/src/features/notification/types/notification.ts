export type NotificationType = "message" | "mention" | "room_invite";

export type NotificationData = {
  roomId?: number;
  messageId?: number;
  senderName?: string;
};

export type NotificationItem = {
  id: number;
  type: NotificationType;
  data: NotificationData;
  read: boolean;
  createdAt: string;
};

export type NotificationsQuery = {
  limit?: number;
  unreadOnly?: boolean;
};

export type MarkNotificationReadResponse = {
  message: string;
  notification: NotificationItem;
};

export type MarkAllNotificationsReadResponse = {
  message: string;
  updatedCount: number;
};
