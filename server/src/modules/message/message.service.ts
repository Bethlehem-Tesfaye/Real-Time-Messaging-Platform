import CustomError from "../../lib/errors";
import { getOnlineUsersLookup } from "../../lib/presence";
import { prisma } from "../../lib/prisma";
import type { MessageItem } from "./types";

const MESSAGE_MAX_LENGTH = 2000;

const resolveSenderName = (sender: {
  name: string;
  profiles: Array<{ displayName: string | null }>;
}) => {
  const displayName = sender.profiles[0]?.displayName?.trim();
  return displayName && displayName.length > 0 ? displayName : sender.name;
};

const toMessageItem = (
  message: {
    id: number;
    content: string;
    roomId: number;
    createdAt: Date;
    sender: {
      id: string;
      name: string;
      image: string | null;
      profiles: Array<{
        displayName: string | null;
      }>;
    };
  },
  senderIsOnline: boolean
): MessageItem => {
  return {
    id: message.id,
    content: message.content,
    senderId: message.sender.id,
    senderName: resolveSenderName(message.sender),
    senderAvatarUrl: message.sender.image,
    senderIsOnline,
    roomId: message.roomId,
    createdAt: message.createdAt.toISOString()
  };
};

export const canUserAccessRoom = async (
  userId: string,
  roomId: number
): Promise<boolean> => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }]
    },
    select: { id: true }
  });

  return !!room;
};

export const getRoomMessagesService = async (
  userId: string,
  roomId: number,
  limit = 50
): Promise<MessageItem[]> => {
  const roomAccess = await canUserAccessRoom(userId, roomId);

  if (!roomAccess) {
    throw new CustomError("You are not a member of this room", 403);
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          profiles: {
            select: {
              displayName: true
            },
            take: 1
          }
        }
      }
    }
  });

  const senderIds = Array.from(
    new Set(messages.map((message) => message.sender.id))
  );
  const onlineUserIds = await getOnlineUsersLookup(senderIds);

  return messages
    .reverse()
    .map((message) =>
      toMessageItem(message, onlineUserIds.has(message.sender.id))
    );
};

export const createMessageService = async (
  userId: string,
  roomId: number,
  content: string
): Promise<MessageItem> => {
  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    throw new CustomError("Message content is required", 400);
  }

  if (trimmedContent.length > MESSAGE_MAX_LENGTH) {
    throw new CustomError("Message exceeds 2000 characters", 400);
  }

  const roomAccess = await canUserAccessRoom(userId, roomId);

  if (!roomAccess) {
    throw new CustomError("You are not a member of this room", 403);
  }

  const createdMessage = await prisma.message.create({
    data: {
      content: trimmedContent,
      senderId: userId,
      roomId
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          profiles: {
            select: {
              displayName: true
            },
            take: 1
          }
        }
      }
    }
  });

  const onlineUserIds = await getOnlineUsersLookup([createdMessage.sender.id]);

  return toMessageItem(
    createdMessage,
    onlineUserIds.has(createdMessage.sender.id)
  );
};
