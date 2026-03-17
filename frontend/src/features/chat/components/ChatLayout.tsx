import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "../../../config/theme";
import { connectSocket } from "../../../lib/socket";
import { useMarkAllNotificationsRead } from "../../notification/hooks/useMarkAllNotificationsRead";
import { useMarkNotificationRead } from "../../notification/hooks/useMarkNotificationRead";
import { useNotifications } from "../../notification/hooks/useNotifications";
import type { NotificationItem } from "../../notification/types/notification";
import ChatMainPanel from "./ChatMainPanel";
import ChatNavRail from "./ChatNavRail";
import GroupsSidebar from "./GroupsSidebar";
import RoomDetailsSidebar from "./RoomDetailsSidebar";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { useDeleteRoom } from "../hooks/useDeleteRoom";
import { useJoinRoom } from "../hooks/useJoinRoom";
import { useLeaveRoom } from "../hooks/useLeaveRoom";
import { useRoomDetails } from "../hooks/useRoomDetails";
import { useRoomMembership } from "../hooks/useRoomMembership";
import { useRoomMessages } from "../hooks/useRoomMessages";
import { useRooms } from "../hooks/useRooms";
import { useSendRoomMessage } from "../hooks/useSendRoomMessage";
import { useUpdateRoom } from "../hooks/useUpdateRoom";
import type {
  ChatMessage,
  RoomDetails,
  RoomMemberItem,
  UserPresenceEvent,
} from "../types/chat";

type RoomFilterScope = "all" | "created" | "member";
const EMPTY_MESSAGES: ChatMessage[] = [];

const ChatLayout = () => {
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
  const [liveNotifications, setLiveNotifications] = useState<
    NotificationItem[]
  >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const [targetMessageId, setTargetMessageId] = useState<number | null>(null);
  const queryClient = useQueryClient();

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
  const sendRoomMessageMutation = useSendRoomMessage();
  const markNotificationReadMutation = useMarkNotificationRead();
  const markAllNotificationsReadMutation = useMarkAllNotificationsRead();

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId],
  );

  const { data: roomDetails, isLoading: roomLoading } =
    useRoomDetails(selectedRoomId);
  const { data: membershipData, isLoading: membershipLoading } =
    useRoomMembership(selectedRoomId);
  const isMember = membershipData?.isMember === true;
  const { data: messagesData, isLoading: messagesLoading } = useRoomMessages(
    selectedRoomId,
    100,
    isMember,
  );
  const { data: notificationData = [] } = useNotifications({ limit: 30 });
  const messages = messagesData ?? EMPTY_MESSAGES;

  const unreadNotificationCount = useMemo(
    () => liveNotifications.filter((notification) => !notification.read).length,
    [liveNotifications],
  );

  const unreadCounts = useMemo(() => {
    return liveNotifications.reduce<Record<number, number>>(
      (acc, notification) => {
        const roomId = notification.data?.roomId;
        if (notification.read || typeof roomId !== "number") {
          return acc;
        }

        acc[roomId] = (acc[roomId] ?? 0) + 1;
        return acc;
      },
      {},
    );
  }, [liveNotifications]);

  const selectedRoomUnreadMessageIds = useMemo(() => {
    if (!selectedRoomId) {
      return [];
    }

    return liveNotifications
      .filter(
        (notification) =>
          !notification.read &&
          notification.data?.roomId === selectedRoomId &&
          typeof notification.data?.messageId === "number",
      )
      .map((notification) => notification.data.messageId as number)
      .sort((a, b) => a - b);
  }, [liveNotifications, selectedRoomId]);

  const mergeMessages = (items: ChatMessage[]) => {
    const deduped = new Map<number, ChatMessage>();
    items.forEach((message) => {
      deduped.set(message.id, message);
    });

    return Array.from(deduped.values()).sort(
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

    return ownerMember?.displayName ?? selectedRoom.ownerId;
  }, [roomDetails, selectedRoom]);

  const roomMembers = useMemo<RoomMemberItem[]>(() => {
    return roomDetails?.members ?? [];
  }, [roomDetails]);

  const syncUserPresence = (userId: string, isOnline: boolean) => {
    if (selectedRoomId) {
      queryClient.setQueryData<RoomDetails>(
        ["room", selectedRoomId],
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            members: previous.members.map((member) =>
              member.id === userId ? { ...member, isOnline } : member,
            ),
          };
        },
      );
    }

    setRoomMessages((previous) =>
      previous.map((message) =>
        message.senderId === userId
          ? { ...message, senderIsOnline: isOnline }
          : message,
      ),
    );
  };

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
    setMessageInput("");
  }, [selectedRoomId]);

  useEffect(() => {
    setLiveNotifications((previous) => {
      const previousById = new Map(previous.map((item) => [item.id, item]));
      const mergedById = new Map<number, NotificationItem>();

      notificationData.forEach((item) => {
        const previousItem = previousById.get(item.id);

        mergedById.set(item.id, {
          ...item,
          read: item.read || previousItem?.read === true,
        });
      });

      previous.forEach((item) => {
        if (!mergedById.has(item.id)) {
          mergedById.set(item.id, item);
        }
      });

      return Array.from(mergedById.values()).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
    });
  }, [notificationData]);

  useEffect(() => {
    const socket = connectSocket();

    const syncSelectedRoomPresence = () => {
      if (!selectedRoomId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["room", selectedRoomId],
      });
    };

    const onReceiveNotification = (notification: NotificationItem) => {
      setLiveNotifications((previous) => {
        const deduped = new Map<number, NotificationItem>();

        [notification, ...previous].forEach((item) => {
          deduped.set(item.id, item);
        });

        return Array.from(deduped.values()).sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        );
      });
    };

    const onUserOnline = (payload: UserPresenceEvent) => {
      syncUserPresence(payload.userId, true);
    };

    const onUserOffline = (payload: UserPresenceEvent) => {
      syncUserPresence(payload.userId, false);
    };

    socket.on("connect", syncSelectedRoomPresence);
    socket.on("receive_notification", onReceiveNotification);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    if (socket.connected) {
      syncSelectedRoomPresence();
    }

    return () => {
      socket.off("connect", syncSelectedRoomPresence);
      socket.off("receive_notification", onReceiveNotification);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
    };
  }, [queryClient, selectedRoomId]);

  useEffect(() => {
    if (!isMember) {
      setRoomMessages((previous) => (previous.length === 0 ? previous : []));
      return;
    }

    setRoomMessages((previous) => {
      const next = mergeMessages(messages);

      if (
        previous.length === next.length &&
        previous.every((item, index) => item.id === next[index]?.id)
      ) {
        return previous;
      }

      return next;
    });
  }, [isMember, messages, selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId || !isMember) {
      return;
    }

    const socket = connectSocket();
    socket.emit("join_room", { roomId: selectedRoomId });

    const onReceiveMessage = (message: ChatMessage) => {
      if (message.roomId !== selectedRoomId) {
        return;
      }

      setRoomMessages((previous) => mergeMessages([...previous, message]));
    };

    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.emit("leave_room", { roomId: selectedRoomId });
      socket.off("receive_message", onReceiveMessage);
    };
  }, [selectedRoomId, isMember]);

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
  };

  const onJoinSelectedRoom = async () => {
    if (!selectedRoomId) {
      return;
    }

    await joinRoomMutation.mutateAsync(selectedRoomId);
  };

  const onSendMessage = async () => {
    if (!selectedRoomId || !isMember || sendRoomMessageMutation.isPending) {
      return;
    }

    const content = messageInput.trim();
    if (!content) {
      return;
    }

    await sendRoomMessageMutation.mutateAsync({
      roomId: selectedRoomId,
      content,
    });
    setScrollToBottomSignal((previous) => previous + 1);
    setMessageInput("");
  };

  const onSelectRoom = (roomId: number, clearTarget = true) => {
    setSelectedRoomId(roomId);
    setIsMobileRoomsOpen(false);

    if (clearTarget) {
      setTargetMessageId(null);
    }
  };

  const onMarkAllNotificationsRead = async () => {
    await markAllNotificationsReadMutation.mutateAsync();
    setLiveNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true })),
    );
  };

  const onNotificationClick = async (notification: NotificationItem) => {
    const roomId = notification.data?.roomId;
    const messageId = notification.data?.messageId;

    if (typeof roomId === "number") {
      onSelectRoom(roomId, false);
    }

    if (typeof messageId === "number") {
      setTargetMessageId(messageId);
    }

    setNotificationsOpen(false);
  };

  const onMessagesRead = (messageIds: number[]) => {
    if (!selectedRoomId || messageIds.length === 0) {
      return;
    }

    const messageIdSet = new Set(messageIds);
    const notificationsToMark = liveNotifications.filter(
      (notification) =>
        !notification.read &&
        notification.data?.roomId === selectedRoomId &&
        typeof notification.data?.messageId === "number" &&
        messageIdSet.has(notification.data.messageId),
    );

    if (notificationsToMark.length === 0) {
      return;
    }

    setLiveNotifications((previous) =>
      previous.map((notification) =>
        notificationsToMark.some((target) => target.id === notification.id)
          ? { ...notification, read: true }
          : notification,
      ),
    );

    notificationsToMark.forEach((notification) => {
      void markNotificationReadMutation.mutateAsync(notification.id);
    });
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
            unreadCounts={unreadCounts}
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
          messages={roomMessages}
          unreadMessageIds={selectedRoomUnreadMessageIds}
          messagesLoading={membershipLoading || (isMember && messagesLoading)}
          currentUserId={user?.id}
          canJoin={membershipData ? !membershipData.isMember : false}
          membershipLoading={membershipLoading}
          onJoinRoom={onJoinSelectedRoom}
          joiningRoom={joinRoomMutation.isPending}
          messageInput={messageInput}
          onMessageInputChange={setMessageInput}
          onSendMessage={onSendMessage}
          sendingMessage={sendRoomMessageMutation.isPending}
          notifications={liveNotifications}
          unreadNotificationCount={unreadNotificationCount}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() =>
            setNotificationsOpen((previous) => !previous)
          }
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onNotificationClick={onNotificationClick}
          markingAllNotificationsRead={
            markAllNotificationsReadMutation.isPending
          }
          forceScrollToBottomSignal={scrollToBottomSignal}
          targetMessageId={targetMessageId}
          onTargetMessageHandled={() => setTargetMessageId(null)}
          onMessagesRead={onMessagesRead}
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
            ownerId={selectedRoom?.ownerId}
            members={roomMembers}
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
            unreadCounts={unreadCounts}
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
            ownerId={selectedRoom?.ownerId}
            members={roomMembers}
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
