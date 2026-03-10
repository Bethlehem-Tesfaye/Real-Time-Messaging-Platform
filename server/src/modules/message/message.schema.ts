import { z } from "zod";
import type { RoomMessagesParams, RoomMessagesQuery } from "./types";

export const roomMessagesParamsSchema: z.ZodType<RoomMessagesParams> = z.object(
  {
    roomId: z
      .string()
      .regex(/^\d+$/, "Room id must be a valid number")
      .refine((value) => Number(value) > 0, "Room id must be greater than 0")
  }
);

export const roomMessagesQuerySchema: z.ZodType<RoomMessagesQuery> = z.object({
  limit: z.string().regex(/^\d+$/, "Limit must be a valid number").optional()
});
