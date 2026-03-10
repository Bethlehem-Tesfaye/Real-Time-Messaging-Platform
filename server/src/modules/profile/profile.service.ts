import { prisma } from "../../lib/prisma";
import CustomError from "../../lib/errors";
import type { ProfileResponse, UpsertProfileInput } from "./types";

const toProfileResponse = (profile: {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  user: {
    email: string;
    name: string;
    image: string | null;
  };
}): ProfileResponse => {
  const isComplete = Boolean(
    profile.username?.trim() && profile.displayName?.trim()
  );

  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    name: profile.user.name,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl ?? profile.user.image,
    isComplete
  };
};

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    }
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          image: true
        }
      }
    }
  });

  if (!profile) {
    return {
      data: {
        id: null,
        userId: user.id,
        email: user.email,
        name: user.name,
        username: null,
        displayName: null,
        bio: null,
        avatarUrl: user.image,
        isComplete: false
      }
    };
  }

  return { data: toProfileResponse(profile) };
};

export const upsertMyProfile = async ({
  userId,
  username,
  displayName,
  bio,
  avatarUrl,
  removeAvatar
}: UpsertProfileInput) => {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedDisplayName = displayName.trim();
  const normalizedBio = bio?.trim() ? bio.trim() : null;

  const takenByOtherUser = await prisma.profile.findFirst({
    where: {
      username: normalizedUsername,
      userId: { not: userId }
    },
    select: { id: true }
  });

  if (takenByOtherUser) {
    throw new CustomError("Username is already taken", 409);
  }

  const updateData: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl?: string | null;
  } = {
    username: normalizedUsername,
    displayName: normalizedDisplayName,
    bio: normalizedBio
  };

  if (removeAvatar) {
    updateData.avatarUrl = null;
  } else if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl;
  }

  const createData: {
    userId: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl?: string | null;
  } = {
    userId,
    username: normalizedUsername,
    displayName: normalizedDisplayName,
    bio: normalizedBio
  };

  if (!removeAvatar && avatarUrl !== undefined) {
    createData.avatarUrl = avatarUrl;
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: createData,
    update: updateData,
    include: {
      user: {
        select: {
          email: true,
          name: true,
          image: true
        }
      }
    }
  });

  return { data: toProfileResponse(profile) };
};
