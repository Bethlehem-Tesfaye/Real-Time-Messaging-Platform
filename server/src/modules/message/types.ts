export type RoomMessagesParams = {
  roomId: string;
};

export type RoomMessagesQuery = {
  limit?: string;
};

export type MessageItem = {
  id: number;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  roomId: number;
  createdAt: string;
};

export type JoinRoomSocketPayload = {
  roomId: number;
};

export type LeaveRoomSocketPayload = {
  roomId: number;
};

export type SendMessageSocketPayload = {
  roomId: number;
  content: string;
};

export type SocketAck = {
  ok: boolean;
  message?: string;
};
