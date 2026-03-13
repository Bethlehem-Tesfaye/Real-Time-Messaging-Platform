import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type {
  MarkNotificationReadResponse,
  NotificationItem,
} from "../types/notification";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotifications";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to mark notification as read"
    );
  }
  return "Failed to mark notification as read";
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { data } = await api.patch<MarkNotificationReadResponse>(
        `/api/notifications/${notificationId}/read`,
      );
      return data;
    },
    onSuccess: (response) => {
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (previous) => {
          if (!previous) {
            return previous;
          }

          return previous.map((item) =>
            item.id === response.notification.id
              ? { ...item, read: true }
              : item,
          );
        },
      );
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
