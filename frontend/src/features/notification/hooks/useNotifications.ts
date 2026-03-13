import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/axios";
import type {
  NotificationItem,
  NotificationsQuery,
} from "../types/notification";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const useNotifications = (query?: NotificationsQuery) => {
  return useQuery({
    queryKey: [
      ...NOTIFICATIONS_QUERY_KEY,
      query?.limit ?? null,
      query?.unreadOnly ?? null,
    ],
    queryFn: async () => {
      const { data } = await api.get<NotificationItem[]>("/api/notifications", {
        params: {
          ...(typeof query?.limit === "number" ? { limit: query.limit } : {}),
          ...(typeof query?.unreadOnly === "boolean"
            ? { unreadOnly: String(query.unreadOnly) }
            : {}),
        },
      });
      return data;
    },
  });
};
