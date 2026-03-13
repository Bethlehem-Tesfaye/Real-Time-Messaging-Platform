import { MessageCircle, Send } from "lucide-react";
import { colors } from "../../../config/theme";
import NotificationBell from "../../notification/components/NotificationBell";
import type { NotificationItem } from "../../notification/types/notification";
import MessageList from "./MessageList";
import type { ChatMessage, RoomListItem } from "../types/chat";

type ChatMainPanelProps = {
  selectedRoom?: RoomListItem;
  messages: ChatMessage[];
  unreadMessageIds: number[];
  messagesLoading: boolean;
  currentUserId?: string;
  canJoin: boolean;
  membershipLoading: boolean;
  onJoinRoom: () => void;
  joiningRoom: boolean;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  onMarkAllNotificationsRead: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  markingAllNotificationsRead: boolean;
  forceScrollToBottomSignal?: number;
  targetMessageId?: number | null;
  onTargetMessageHandled?: () => void;
  onMessagesRead?: (messageIds: number[]) => void;
  onOpenRooms?: () => void;
  onOpenDetails?: () => void;
};

const ChatMainPanel = ({
  selectedRoom,
  messages,
  unreadMessageIds,
  messagesLoading,
  currentUserId,
  canJoin,
  membershipLoading,
  onJoinRoom,
  joiningRoom,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  sendingMessage,
  notifications,
  unreadNotificationCount,
  notificationsOpen,
  onToggleNotifications,
  onMarkAllNotificationsRead,
  onNotificationClick,
  markingAllNotificationsRead,
  forceScrollToBottomSignal,
  targetMessageId,
  onTargetMessageHandled,
  onMessagesRead,
  onOpenRooms,
  onOpenDetails,
}: ChatMainPanelProps) => {
  if (!selectedRoom) {
    return (
      <main
        className="flex-1 rounded-3xl border p-6"
        style={{
          borderColor: `${colors.secondary}33`,
          backgroundColor: `${colors.bg}66`,
        }}
      >
        <div className="grid h-full place-items-center">
          <p style={{ color: colors.secondary }}>
            Select a group from the left sidebar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-[70vh] flex-1 flex-col rounded-3xl border"
      style={{
        borderColor: `${colors.secondary}20`,
        backgroundColor: "#EDEFF5",
      }}
    >
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: `${colors.secondary}20` }}
      >
        <div>
          <h1
            className="text-[2rem] font-extrabold tracking-tight xl:text-[2.2rem]"
            style={{ color: colors.primary }}
          >
            {selectedRoom.name}
          </h1>
          <p
            className="text-sm xl:text-[0.95rem]"
            style={{ color: colors.secondary }}
          >
            Group chat
          </p>
        </div>

        <div className="flex items-center gap-2 xl:gap-3">
          <button
            type="button"
            onClick={onOpenRooms}
            className="rounded-xl px-3 py-2 text-xs font-semibold lg:hidden"
            style={{
              backgroundColor: `${colors.secondary}16`,
              color: colors.primary,
            }}
          >
            Rooms
          </button>
          <button
            type="button"
            onClick={onOpenDetails}
            className="rounded-xl px-3 py-2 text-xs font-semibold lg:hidden"
            style={{
              backgroundColor: `${colors.secondary}16`,
              color: colors.primary,
            }}
          >
            Details
          </button>

          <div
            className="hidden rounded-xl px-5 py-2 text-sm font-semibold md:block xl:px-6 xl:text-[0.95rem]"
            style={{
              backgroundColor: `${colors.online}24`,
              color: colors.online,
            }}
          >
            Messages
          </div>
          <div
            className="hidden rounded-xl px-5 py-2 text-sm font-semibold md:block xl:px-6 xl:text-[0.95rem]"
            style={{ color: colors.secondary }}
          >
            Participants
          </div>
          {!membershipLoading && canJoin && (
            <button
              type="button"
              onClick={onJoinRoom}
              disabled={joiningRoom}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 xl:px-5 xl:text-[0.95rem]"
              style={{ backgroundColor: colors.secondary }}
            >
              {joiningRoom ? "Joining..." : "Join"}
            </button>
          )}

          <NotificationBell
            notifications={notifications}
            unreadCount={unreadNotificationCount}
            open={notificationsOpen}
            onToggle={onToggleNotifications}
            onMarkAllRead={onMarkAllNotificationsRead}
            onNotificationClick={onNotificationClick}
            markingAllRead={markingAllNotificationsRead}
          />
        </div>
      </header>

      <MessageList
        roomId={selectedRoom.id}
        messages={messages}
        currentUserId={currentUserId}
        loading={messagesLoading}
        showJoinPrompt={canJoin}
        unreadMessageIds={unreadMessageIds}
        forceScrollToBottomSignal={forceScrollToBottomSignal}
        targetMessageId={targetMessageId}
        onTargetMessageHandled={onTargetMessageHandled}
        onMessagesRead={onMessagesRead}
      />

      <footer
        className="border-t px-5 py-4"
        style={{ borderColor: `${colors.secondary}20` }}
      >
        <div
          className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3"
          style={{ borderColor: `${colors.secondary}24` }}
        >
          <MessageCircle
            className="h-4 w-4"
            style={{ color: colors.secondary }}
          />
          <input
            value={messageInput}
            onChange={(event) => onMessageInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSendMessage();
              }
            }}
            disabled={canJoin || sendingMessage}
            placeholder="Write your message..."
            className="w-full bg-transparent text-sm outline-none xl:text-[0.95rem]"
            style={{ color: colors.primary }}
          />
          <button
            type="button"
            onClick={onSendMessage}
            disabled={
              canJoin || sendingMessage || messageInput.trim().length === 0
            }
            className="grid h-9 w-9 place-items-center rounded-xl text-white"
            style={{ backgroundColor: colors.online }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </main>
  );
};

export default ChatMainPanel;
