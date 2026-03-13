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

export type RoomDetails = RoomListItem & {
  members: RoomMemberItem[];
};

export type CreateRoomInput = {
  name: string;
  is_private?: boolean;
  avatar?: File | null;
};

export type JoinRoomResponse = {
  message: string;
};

export type UpdateRoomInput = {
  id: number;
  name?: string;
  is_private?: boolean;
  avatar?: File | null;
  removeAvatar?: boolean;
};

export type RoomActionResponse = {
  message: string;
};

export type RoomMembershipResponse = {
  roomId: number;
  isMember: boolean;
};
