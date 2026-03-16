import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { ChatMessage } from "../types/chat";

type SendRoomMessageInput = {
  roomId: number;
  content: string;
  localId?: string;
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
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
