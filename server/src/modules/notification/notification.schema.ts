import { z } from "zod";
import type { ListNotificationsQuery, NotificationIdParams } from "./types";

export const listNotificationsQuerySchema: z.ZodType<ListNotificationsQuery> =
  z.object({
    limit: z.string().regex(/^\d+$/, "Limit must be a valid number").optional(),
    unreadOnly: z.enum(["true", "false"]).optional()
  });

export const notificationIdParamsSchema: z.ZodType<NotificationIdParams> =
  z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Notification id must be a valid number")
      .refine(
        (value) => Number(value) > 0,
        "Notification id must be greater than 0"
      )
  });
