import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "../../../config/theme";
import { api } from "../../../lib/axios";
import { connectSocket } from "../../../lib/socket";
import ChatMainPanel from "./ChatMainPanel";
import ChatNavRail from "./ChatNavRail";
import GroupsSidebar from "./GroupsSidebar";
import RoomDetailsSidebar from "./RoomDetailsSidebar";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useDeleteRoom } from "../hooks/useDeleteRoom";
import { useJoinRoom } from "../hooks/useJoinRoom";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import { useRoomMessages } from "../hooks/useRoomMessages";
import { useRoomDetails } from "../hooks/useRoomDetails";
import { useRoomMembership } from "../hooks/useRoomMembership";
import { useRooms } from "../hooks/useRooms";
import { useUpdateRoom } from "../hooks/useUpdateRoom";
import type { ChatMessage, RoomMembershipResponse } from "../types/chat";

type RoomFilterScope = "all" | "created" | "member";

const ChatLayout = () => {
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<number | undefined>(
    undefined,
  );
  const [roomFilterScope, setRoomFilterScope] =
    useState<RoomFilterScope>("all");
  const [roomSearch, setRoomSearch] = useState("");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isMobileRoomsOpen, setIsMobileRoomsOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);

  const { user } = useCurrentUser();
  const { data: rooms = [], isLoading: roomsLoading } = useRooms({
    scope: roomFilterScope,
    search: roomSearch,
  });
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const leaveRoomMutation = useLeaveRoom();
  const joinRoomMutation = useJoinRoom();

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId],
  );

  const { data: roomDetails, isLoading: roomLoading } =
    useRoomDetails(selectedRoomId);
  const { data: membershipData, isLoading: membershipLoading } =
    useRoomMembership(selectedRoomId);
  const isMember = membershipData?.isMember === true;
  const canJoin = membershipData ? !membershipData.isMember : false;
  const { data: messageHistory = [], isLoading: messagesLoading } =
    useRoomMessages(selectedRoomId, 100, isMember);
  const shouldShowMessageSkeleton =
    membershipLoading ||
    joinRoomMutation.isPending ||
    (isMember && messagesLoading);

  const mergeMessages = (messages: ChatMessage[]): ChatMessage[] => {
    const dedup = new Map<number, ChatMessage>();

    messages.forEach((message) => {
      dedup.set(message.id, message);
    });

    return Array.from(dedup.values()).sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
    );
  };

  const ownerName = useMemo(() => {
    if (!selectedRoom || !roomDetails) {
      return undefined;
    }

    const ownerMember = roomDetails.members.find(
      (member) => member.id === selectedRoom.ownerId,
    );

    return ownerMember?.username ?? selectedRoom.ownerId;
  }, [roomDetails, selectedRoom]);

  useEffect(() => {
    if (rooms.length === 0) {
      setSelectedRoomId(undefined);
      return;
    }

    const selectedStillExists = rooms.some(
      (room) => room.id === selectedRoomId,
    );

    if (!selectedRoomId || !selectedStillExists) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    setRoomMessages(messageHistory);
  }, [messageHistory, selectedRoomId]);

  useEffect(() => {
    if (!isMember) {
      setRoomMessages([]);
    }
  }, [isMember, selectedRoomId]);

  useEffect(() => {
    const socket = connectSocket();

    const onReceiveMessage = (message: ChatMessage) => {
      if (message.roomId !== selectedRoomId) {
        return;
      }

      setRoomMessages((prev) => mergeMessages([...prev, message]));
    };

    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("receive_message", onReceiveMessage);
    };
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const socket = connectSocket();
    socket.emit("join_room", { roomId: selectedRoomId });
  }, [selectedRoomId]);

  const onCreateRoom = async (payload: {
    name: string;
    is_private: boolean;
    avatar?: File | null;
  }) => {
    const createdRoom = await createRoomMutation.mutateAsync({
      name: payload.name,
      is_private: payload.is_private,
      avatar: payload.avatar,
    });

    setSelectedRoomId(createdRoom.id);
  };

  const onJoinSelectedRoom = async () => {
    if (!selectedRoomId) {
      return;
    }

    setRoomMessages([]);

    await joinRoomMutation.mutateAsync(selectedRoomId);

    queryClient.setQueryData<RoomMembershipResponse>(
      ["room-membership", selectedRoomId],
      {
        roomId: selectedRoomId,
        isMember: true,
      },
    );

    await queryClient.invalidateQueries({
      queryKey: ["room-membership", selectedRoomId],
    });

    const socket = connectSocket();
    socket.emit("join_room", { roomId: selectedRoomId });

    await queryClient.invalidateQueries({
      queryKey: ["room-messages", selectedRoomId],
    });

    const { data: freshMessages } = await api.get<ChatMessage[]>(
      `/api/messages/rooms/${selectedRoomId}`,
      {
        params: { limit: 100 },
      },
    );

    queryClient.setQueryData(
      ["room-messages", selectedRoomId, 100],
      freshMessages,
    );
    setRoomMessages(freshMessages);
  };

  const onUpdateRoom = async (payload: {
    id: number;
    name?: string;
    is_private?: boolean;
    avatar?: File | null;
    removeAvatar?: boolean;
  }) => {
    await updateRoomMutation.mutateAsync(payload);
  };

  const onDeleteRoom = async (roomId: number) => {
    await deleteRoomMutation.mutateAsync(roomId);
  };

  const onLeaveRoom = async (roomId: number) => {
    await leaveRoomMutation.mutateAsync(roomId);

    const socket = connectSocket();
    socket.emit("leave_room", { roomId });

    if (selectedRoomId === roomId) {
      setRoomMessages([]);
      setMessageInput("");
      await queryClient.invalidateQueries({
        queryKey: ["room-membership", roomId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["room-messages", roomId],
      });
    }
  };

  const onSelectRoom = (roomId: number) => {
    setRoomMessages([]);
    setMessageInput("");
    setSelectedRoomId(roomId);
    setIsMobileRoomsOpen(false);
  };

  const onSendMessage = () => {
    if (!selectedRoomId) {
      return;
    }

    const content = messageInput.trim();
    if (content.length === 0) {
      return;
    }

    const socket = connectSocket();
    socket.emit("send_message", {
      roomId: selectedRoomId,
      content,
    });
    setMessageInput("");
  };

  return (
    <div className="h-screen w-full " style={{ backgroundColor: colors.bg }}>
      <div
        className="relative flex h-full w-full flex-row border p-2 lg:gap-3"
        style={{
          borderColor: `${colors.secondary}22`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <ChatNavRail />

        <div className="hidden min-h-0 lg:block">
          <GroupsSidebar
            rooms={rooms}
            roomsLoading={roomsLoading}
            selectedRoomId={selectedRoomId}
            currentUserId={user?.id}
            activeTab={roomFilterScope}
            searchQuery={roomSearch}
            collapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed((prev) => !prev)}
            onSelectRoom={onSelectRoom}
            onTabChange={setRoomFilterScope}
            onSearchQueryChange={setRoomSearch}
            onCreateRoom={onCreateRoom}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            onLeaveRoom={onLeaveRoom}
            creatingRoom={createRoomMutation.isPending}
            updatingRoom={updateRoomMutation.isPending}
            deletingRoom={deleteRoomMutation.isPending}
            leavingRoom={leaveRoomMutation.isPending}
          />
        </div>

        <ChatMainPanel
          selectedRoom={selectedRoom}
          memberCount={roomLoading ? 0 : (roomDetails?.members.length ?? 0)}
          memberCountLoading={roomLoading}
          messages={roomMessages}
          messagesLoading={shouldShowMessageSkeleton}
          currentUserId={user?.id}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={onSendMessage}
          canJoin={canJoin}
          onJoinRoom={onJoinSelectedRoom}
          joiningRoom={joinRoomMutation.isPending}
          onOpenRooms={() => {
            setIsMobileDetailsOpen(false);
            setIsMobileRoomsOpen(true);
          }}
          onOpenDetails={() => {
            setIsMobileRoomsOpen(false);
            setIsMobileDetailsOpen(true);
          }}
        />

        <div className="hidden lg:block">
          <RoomDetailsSidebar
            collapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed((prev) => !prev)}
            roomName={selectedRoom?.name}
            roomAvatarUrl={selectedRoom?.avatarUrl}
            ownerName={ownerName}
            participantCount={
              roomLoading ? 0 : (roomDetails?.members.length ?? 0)
            }
          />
        </div>

        {(isMobileRoomsOpen || isMobileDetailsOpen) && (
          <button
            type="button"
            onClick={() => {
              setIsMobileRoomsOpen(false);
              setIsMobileDetailsOpen(false);
            }}
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
            aria-label="Close sidebar overlay"
          />
        )}

        <div
          className={`fixed top-2 right-2 bottom-2 z-50 w-[min(88vw,22rem)] transition-transform duration-300 lg:hidden ${
            isMobileRoomsOpen
              ? "translate-x-0"
              : "pointer-events-none translate-x-[110%]"
          }`}
        >
          <GroupsSidebar
            rooms={rooms}
            roomsLoading={roomsLoading}
            selectedRoomId={selectedRoomId}
            currentUserId={user?.id}
            activeTab={roomFilterScope}
            searchQuery={roomSearch}
            collapsed={false}
            onToggleCollapse={() => setIsMobileRoomsOpen(false)}
            onSelectRoom={onSelectRoom}
            onTabChange={setRoomFilterScope}
            onSearchQueryChange={setRoomSearch}
            onCreateRoom={onCreateRoom}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            onLeaveRoom={onLeaveRoom}
            creatingRoom={createRoomMutation.isPending}
            updatingRoom={updateRoomMutation.isPending}
            deletingRoom={deleteRoomMutation.isPending}
            leavingRoom={leaveRoomMutation.isPending}
          />
        </div>

        <div
          className={`fixed top-2 right-2 bottom-2 z-50 w-[min(88vw,22rem)] transition-transform duration-300 lg:hidden ${
            isMobileDetailsOpen
              ? "translate-x-0"
              : "pointer-events-none translate-x-[110%]"
          }`}
        >
          <RoomDetailsSidebar
            collapsed={false}
            onToggleCollapse={() => setIsMobileDetailsOpen(false)}
            roomName={selectedRoom?.name}
            roomAvatarUrl={selectedRoom?.avatarUrl}
            ownerName={ownerName}
            participantCount={
              roomLoading ? 0 : (roomDetails?.members.length ?? 0)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
