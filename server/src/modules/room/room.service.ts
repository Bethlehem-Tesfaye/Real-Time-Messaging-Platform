import { prisma } from "../../lib/prisma";
import redisClient from "../../lib/redisClient";
import { logger } from "../../config/logger";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache";
import { invalidateRoomsListCache } from "../../lib/cache/roomsCache";
import { mapRoomListItem } from "../../utils/roomMappers";
import CustomError from "../../lib/errors";
import type {
  CreateRoomBody,
  JoinRoomResponse,
  ListRoomsQuery,
  RoomActionResponse,
  RoomDetailsResponse,
  RoomMembershipResponse,
  RoomListItem,
  UpdateRoomBody
} from "./types";

export const listRoomsService = async (
  userId: string,
  filters?: ListRoomsQuery
): Promise<RoomListItem[]> => {
  const scope = filters?.scope ?? "all";
  const search = filters?.search?.trim();

  if (scope === "created" || scope === "member" || search) {
    const rooms = await prisma.room.findMany({
      where: {
        ...(scope === "created"
          ? { ownerId: userId }
          : scope === "member"
            ? {
                ownerId: { not: userId },
                members: { some: { userId } }
              }
            : {
                OR: [
                  { isPrivate: false },
                  {
                    isPrivate: true,
                    members: { some: { userId } }
                  }
                ]
              }),
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          : {})
      },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        ownerId: true,
        avatarUrl: true
      },
      orderBy: { createdAt: "desc" }
    });

    return rooms.map(mapRoomListItem);
  }

  let publicRooms: RoomListItem[] = [];

  try {
    if (redisClient.isOpen) {
      const cachedRooms = await redisClient.get(CACHE_KEYS.ROOMS_LIST);
      if (cachedRooms) {
        try {
          publicRooms = JSON.parse(cachedRooms) as RoomListItem[];
          logger.info(
            `Rooms fetched from Redis cache (${publicRooms.length} rooms ${cachedRooms} )`
          );
        } catch {
          await redisClient.del(CACHE_KEYS.ROOMS_LIST);
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed reading room list from cache");
  }

  if (!publicRooms.length) {
    const publicRoomsFromDb = await prisma.room.findMany({
      where: { isPrivate: false },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        ownerId: true,
        avatarUrl: true
      },
      orderBy: { createdAt: "desc" }
    });

    publicRooms = publicRoomsFromDb.map(mapRoomListItem);

    try {
      if (redisClient.isOpen) {
        await redisClient.set(
          CACHE_KEYS.ROOMS_LIST,
          JSON.stringify(publicRooms),
          { EX: CACHE_TTL.ROOMS_LIST }
        );
      }
    } catch (err) {
      logger.error({ err }, "Failed writing room list cache");
    }
  }

  const privateMemberRooms = await prisma.room.findMany({
    where: {
      isPrivate: true,
      members: { some: { userId } }
    },
    select: {
      id: true,
      name: true,
      isPrivate: true,
      ownerId: true,
      avatarUrl: true
    },
    orderBy: { createdAt: "desc" }
  });

  const combinedRooms = [
    ...publicRooms,
    ...privateMemberRooms.map(mapRoomListItem)
  ];
  const uniqueRoomMap = new Map<number, RoomListItem>();

  combinedRooms.forEach((room) => {
    uniqueRoomMap.set(room.id, room);
  });

  return Array.from(uniqueRoomMap.values());
};

export const createRoomService = async (
  userId: string,
  data: CreateRoomBody
): Promise<RoomListItem> => {
  const isPrivate = data.is_private ?? false;

  const room = await prisma.$transaction(async (tx) => {
    const createdRoom = await tx.room.create({
      data: {
        name: data.name,
        isPrivate,
        ownerId: userId,
        avatarUrl: data.avatarUrl
      }
    });

    await tx.roomMember.create({
      data: {
        roomId: createdRoom.id,
        userId
      }
    });

    return createdRoom;
  });

  await invalidateRoomsListCache();

  return {
    id: room.id,
    name: room.name,
    is_private: room.isPrivate,
    ownerId: room.ownerId,
    avatarUrl: room.avatarUrl
  };
};

export const joinRoomService = async (
  userId: string,
  roomId: number
): Promise<JoinRoomResponse> => {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new CustomError("Invalid room id", 400);
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, isPrivate: true }
  });

  if (!room) {
    throw new CustomError("Room not found", 404);
  }

  if (room.isPrivate) {
    throw new CustomError("Joining private rooms is not allowed", 403);
  }

  const existingMembership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId
      }
    },
    select: { id: true }
  });

  if (existingMembership) {
    throw new CustomError("User is already a member of this room", 409);
  }

  await prisma.roomMember.create({
    data: {
      roomId,
      userId
    }
  });

  await invalidateRoomsListCache();

  return { message: "Joined room successfully" };
};

export const getRoomDetailsService = async (
  roomId: number
): Promise<RoomDetailsResponse> => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      name: true,
      isPrivate: true,
      ownerId: true,
      avatarUrl: true,
      members: {
        select: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!room) {
    throw new CustomError("Room not found", 404);
  }

  return {
    id: room.id,
    name: room.name,
    is_private: room.isPrivate,
    ownerId: room.ownerId,
    avatarUrl: room.avatarUrl,
    members: room.members.map((member) => ({
      id: member.user.id,
      username: member.user.name
    }))
  };
};

export const updateRoomService = async (
  userId: string,
  roomId: number,
  data: UpdateRoomBody
): Promise<RoomListItem> => {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new CustomError("Invalid room id", 400);
  }

  const existingRoom = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, ownerId: true }
  });

  if (!existingRoom) {
    throw new CustomError("Room not found", 404);
  }

  if (existingRoom.ownerId !== userId) {
    throw new CustomError("Only room owner can edit this room", 403);
  }

  const updateData: {
    name?: string;
    isPrivate?: boolean;
    avatarUrl?: string | null;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.is_private !== undefined) {
    updateData.isPrivate = data.is_private;
  }

  if (data.removeAvatar === true) {
    updateData.avatarUrl = null;
  } else if (data.avatarUrl !== undefined) {
    updateData.avatarUrl = data.avatarUrl;
  }

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: updateData,
    select: {
      id: true,
      name: true,
      isPrivate: true,
      ownerId: true,
      avatarUrl: true
    }
  });

  await invalidateRoomsListCache();

  return mapRoomListItem(updatedRoom);
};

export const deleteRoomService = async (
  userId: string,
  roomId: number
): Promise<RoomActionResponse> => {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new CustomError("Invalid room id", 400);
  }

  const existingRoom = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, ownerId: true }
  });

  if (!existingRoom) {
    throw new CustomError("Room not found", 404);
  }

  if (existingRoom.ownerId !== userId) {
    throw new CustomError("Only room owner can delete this room", 403);
  }

  await prisma.room.delete({ where: { id: roomId } });
  await invalidateRoomsListCache();

  return { message: "Room deleted" };
};

export const leaveRoomService = async (
  userId: string,
  roomId: number
): Promise<RoomActionResponse> => {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new CustomError("Invalid room id", 400);
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, ownerId: true }
  });

  if (!room) {
    throw new CustomError("Room not found", 404);
  }

  if (room.ownerId === userId) {
    throw new CustomError("Owner cannot leave room. Delete it instead", 403);
  }

  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId
      }
    },
    select: { id: true }
  });

  if (!membership) {
    throw new CustomError("You are not a member of this room", 404);
  }

  await prisma.roomMember.delete({
    where: {
      roomId_userId: {
        roomId,
        userId
      }
    }
  });

  await invalidateRoomsListCache();

  return { message: "Left room successfully" };
};

export const getRoomMembershipService = async (
  userId: string,
  roomId: number
): Promise<RoomMembershipResponse> => {
  if (!Number.isInteger(roomId) || roomId <= 0) {
    throw new CustomError("Invalid room id", 400);
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true }
  });

  if (!room) {
    throw new CustomError("Room not found", 404);
  }

  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId
      }
    },
    select: { id: true }
  });

  return {
    roomId,
    isMember: Boolean(membership)
  };
};
