export type CreateRoomBody = {
  name: string;
  is_private?: boolean;
  avatarUrl?: string;
};

export type UpdateRoomBody = {
  name?: string;
  is_private?: boolean;
  avatarUrl?: string;
  removeAvatar?: boolean;
};

export type RoomIdParams = {
  id: string;
};

export type ListRoomsQuery = {
  scope?: "all" | "created" | "member";
  search?: string;
};

export type RoomListItem = {
  id: number;
  name: string;
  is_private: boolean;
  ownerId: string;
  avatarUrl: string | null;
};

export type RoomMemberItem = {
  id: string;
  username: string;
};

export type RoomDetailsResponse = RoomListItem & {
  members: RoomMemberItem[];
};

export type JoinRoomResponse = {
  message: string;
};

export type RoomActionResponse = {
  message: string;
};

export type RoomMembershipResponse = {
  roomId: number;
  isMember: boolean;
};
