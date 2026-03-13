export type Profile = {
  id: string | null;
  userId: string;
  email: string;
  name: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isComplete: boolean;
};

export type ProfileApiResponse = {
  data: Profile;
};

export type UpsertProfileInput = {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: File | null;
  removeAvatar?: boolean;
};
