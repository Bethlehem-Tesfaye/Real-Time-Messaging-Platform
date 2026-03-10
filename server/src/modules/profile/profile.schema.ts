import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscore"
    ),
  displayName: z
    .string({ message: "Display name is required" })
    .trim()
    .min(1, "Display name is required")
    .max(60, "Display name must be at most 60 characters"),
  bio: z
    .string()
    .trim()
    .max(280, "Bio must be at most 280 characters")
    .optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
  removeAvatar: z
    .preprocess((value) => value === "true" || value === true, z.boolean())
    .optional()
});
