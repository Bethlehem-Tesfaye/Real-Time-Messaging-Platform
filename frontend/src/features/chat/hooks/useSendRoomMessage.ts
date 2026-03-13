import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { ChatMessage } from "../types/chat";

type SendRoomMessageInput = {
  roomId: number;
  content: string;
};

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to send message"
    );
  }
  return "Failed to send message";
};

export const useSendRoomMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: SendRoomMessageInput) => {
      const { data } = await api.post<ChatMessage>(
        `/api/messages/rooms/${roomId}`,
        {
          content,
        },
      );
      return data;
    },
    onSuccess: (createdMessage, variables) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["room-messages", variables.roomId, 100],
        (previous = []) => {
          const next = [...previous, createdMessage];
          const deduped = new Map<number, ChatMessage>();

          next.forEach((message) => {
            deduped.set(message.id, message);
          });

          return Array.from(deduped.values()).sort(
            (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
          );
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["room-messages", variables.roomId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
