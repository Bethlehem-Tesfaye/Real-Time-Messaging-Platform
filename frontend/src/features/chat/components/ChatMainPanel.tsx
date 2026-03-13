import { MessageCircle, Send } from "lucide-react";
import { colors } from "../../../config/theme";
import type { RoomListItem } from "../types/chat";

type ChatMainPanelProps = {
  selectedRoom?: RoomListItem;
  canJoin: boolean;
  membershipLoading: boolean;
  onJoinRoom: () => void;
  joiningRoom: boolean;
  onOpenRooms?: () => void;
  onOpenDetails?: () => void;
};

const ChatMainPanel = ({
  selectedRoom,
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
        </div>
      </header>

      <section className="relative flex-1 p-6">
        <div className="space-y-4">
          <div
            className="max-w-[68%] rounded-2xl bg-white px-4 py-3 text-sm shadow-sm xl:text-[0.96rem]"
            style={{ color: colors.primary }}
          >
            Messages area placeholder — real-time conversation UI goes here.
          </div>
          <div
            className="ml-auto max-w-[60%] rounded-2xl px-4 py-3 text-sm text-white shadow-sm xl:text-[0.96rem]"
            style={{ backgroundColor: `${colors.secondary}CC` }}
          >
            Keep this center panel structure for incoming/outgoing messages.
          </div>
          <div
            className="max-w-[55%] rounded-2xl bg-white px-4 py-3 text-sm shadow-sm xl:text-[0.96rem]"
            style={{ color: colors.primary }}
          >
            You can now focus on socket events and message persistence next.
          </div>
        </div>
      </section>

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
            disabled
            placeholder="Write your message..."
            className="w-full bg-transparent text-sm outline-none xl:text-[0.95rem]"
            style={{ color: colors.primary }}
          />
          <button
            type="button"
            disabled
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
