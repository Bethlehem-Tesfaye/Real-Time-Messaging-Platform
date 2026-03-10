import { colors } from "../../../config/theme";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import RoomHeader from "./RoomHeader";
import type { ChatMessage, RoomListItem } from "../types/chat";

type ChatMainPanelProps = {
  selectedRoom?: RoomListItem;
  memberCount: number;
  messages: ChatMessage[];
  messagesLoading: boolean;
  currentUserId?: string;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  canJoin: boolean;
  membershipLoading: boolean;
  onJoinRoom: () => void;
  joiningRoom: boolean;
  onOpenRooms?: () => void;
  onOpenDetails?: () => void;
};

const ChatMainPanel = ({
  selectedRoom,
  memberCount,
  messages,
  messagesLoading,
  currentUserId,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  canJoin,
  membershipLoading,
  onJoinRoom,
  joiningRoom,
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
      className="flex min-h-[70vh] min-w-0 flex-1 flex-col rounded-3xl border"
      style={{
        borderColor: `${colors.secondary}20`,
        backgroundColor: "#EDEFF5",
      }}
    >
      <RoomHeader
        roomName={selectedRoom.name}
        memberCount={memberCount}
        canJoin={canJoin}
        membershipLoading={membershipLoading}
        joiningRoom={joiningRoom}
        onJoinRoom={onJoinRoom}
        onOpenRooms={onOpenRooms}
        onOpenDetails={onOpenDetails}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={messagesLoading}
      />

      <MessageInput
        value={messageInput}
        onChange={onMessageInputChange}
        onSend={onSendMessage}
        disabled={joiningRoom}
      />
    </main>
  );
};

export default ChatMainPanel;
