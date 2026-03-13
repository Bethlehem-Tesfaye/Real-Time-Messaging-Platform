import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type {
  MarkAllNotificationsReadResponse,
  NotificationItem,
} from "../types/notification";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to mark all notifications as read"
    );
  }
  return "Failed to mark all notifications as read";
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<MarkAllNotificationsReadResponse>(
        "/api/notifications/read-all",
      );
      return data;
    },
    onSuccess: () => {
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (previous) => {
          if (!previous) {
            return previous;
          }

          return previous.map((item) => ({ ...item, read: true }));
        },
      );
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
