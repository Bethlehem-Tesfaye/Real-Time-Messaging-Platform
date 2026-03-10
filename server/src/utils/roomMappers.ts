import type { RoomListItem } from "../modules/room/types";

export const mapRoomListItem = (room: {
  id: number;
  name: string;
  isPrivate: boolean;
  ownerId: string;
  avatarUrl: string | null;
}): RoomListItem => ({
  id: room.id,
  name: room.name,
  is_private: room.isPrivate,
  ownerId: room.ownerId,
  avatarUrl: room.avatarUrl
});
