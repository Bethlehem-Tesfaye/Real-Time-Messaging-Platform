import { z } from "zod";
import type {
  CreateRoomBody,
  ListRoomsQuery,
  RoomIdParams,
  UpdateRoomBody
} from "./types";

const booleanFromUnknown = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean());

export const createRoomSchema: z.ZodType<CreateRoomBody> = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Room name is required")
    .max(100, "Room name must be at most 100 characters"),
  is_private: booleanFromUnknown.optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional()
});

export const updateRoomSchema: z.ZodType<UpdateRoomBody> = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Room name is required")
    .max(100, "Room name must be at most 100 characters")
    .optional(),
  is_private: booleanFromUnknown.optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
  removeAvatar: booleanFromUnknown.optional()
});

export const roomIdParamsSchema: z.ZodType<RoomIdParams> = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Room id must be a valid number")
    .refine((value) => Number(value) > 0, "Room id must be greater than 0")
});

export const listRoomsQuerySchema: z.ZodType<ListRoomsQuery> = z.object({
  scope: z.enum(["all", "created", "member"]).optional(),
  search: z.string().trim().max(100, "Search is too long").optional()
});
