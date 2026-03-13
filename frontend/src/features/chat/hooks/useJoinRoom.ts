import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { api } from "../../../lib/axios";
import type { JoinRoomResponse } from "../types/chat";
import { ROOMS_QUERY_KEY } from "./useRooms";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to join room"
    );
  }
  return "Failed to join room";
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const { data } = await api.post<JoinRoomResponse>(
        `/api/rooms/${roomId}/join`,
      );
      return data;
    },
    onSuccess: (response, roomId) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      toast.success(response.message || "Joined room successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
