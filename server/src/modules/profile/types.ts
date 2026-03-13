export interface UpsertProfileInput {
  userId: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  removeAvatar?: boolean;
}

export interface ProfileResponse {
  id: string | null;
  userId: string;
  email: string;
  name: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isComplete: boolean;
}
