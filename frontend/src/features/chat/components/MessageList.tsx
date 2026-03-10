import { useEffect, useMemo, useRef } from "react";
import { colors } from "../../../config/theme";
import type { ChatMessage } from "../types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId?: string;
  loading: boolean;
  showJoinPrompt: boolean;
  joiningRoom: boolean;
  onJoinRoom: () => void;
};

const MessageList = ({
  messages,
  currentUserId,
  loading,
  showJoinPrompt,
  joiningRoom,
  onJoinRoom,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      ),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  if (loading) {
    return (
      <section className="relative flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-4 animate-pulse">
          {[0, 1, 2, 3, 4].map((item) => {
            const mine = item % 2 === 1;
            return (
              <div
                key={item}
                className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <div
                    className="h-8 w-8 shrink-0 rounded-full"
                    style={{ backgroundColor: `${colors.secondary}24` }}
                  />
                )}

                <div
                  className={`rounded-2xl px-3 py-2 ${mine ? "w-[56%]" : "w-[64%]"}`}
                  style={{
                    backgroundColor: mine ? `${colors.secondary}40` : "#FFFFFF",
                  }}
                >
                  {!mine && (
                    <div
                      className="mb-2 h-3 w-20 rounded"
                      style={{ backgroundColor: `${colors.secondary}24` }}
                    />
                  )}
                  <div
                    className="h-3 w-[90%] rounded"
                    style={{ backgroundColor: `${colors.secondary}24` }}
                  />
                  <div
                    className="mt-2 h-3 w-[65%] rounded"
                    style={{ backgroundColor: `${colors.secondary}1A` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (showJoinPrompt) {
    return (
      <section className="relative flex-1 p-6">
        <div className="grid h-full place-items-center">
          <div
            className="max-w-sm rounded-2xl border bg-white px-5 py-5 text-center"
            style={{ borderColor: `${colors.secondary}25` }}
          >
            <p className="text-sm" style={{ color: colors.secondary }}>
              Join to see and send messages
            </p>
            <button
              type="button"
              onClick={onJoinRoom}
              disabled={joiningRoom}
              className="mt-4 h-10 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: colors.secondary }}
            >
              {joiningRoom ? "Joining..." : "Join room"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (sortedMessages.length === 0) {
    return (
      <section className="relative flex-1 p-6">
        <div className="grid h-full place-items-center">
          <p className="text-sm" style={{ color: colors.secondary }}>
            No message here yet..
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-4">
        {sortedMessages.map((message) => {
          const mine = message.senderId === currentUserId;
          const senderInitial =
            message.senderName.trim().charAt(0).toUpperCase() || "U";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-bold"
                  style={{
                    color: colors.primary,
                    backgroundColor: `${colors.secondary}1A`,
                  }}
                >
                  {message.senderAvatarUrl ? (
                    <img
                      src={message.senderAvatarUrl}
                      alt={message.senderName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    senderInitial
                  )}
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 sm:max-w-[70%] ${mine ? "text-white" : "bg-white"}`}
                style={{
                  backgroundColor: mine ? `${colors.secondary}CC` : "#FFFFFF",
                  color: mine ? "#FFFFFF" : colors.primary,
                }}
              >
                {!mine && (
                  <p
                    className="mb-1 text-xs font-semibold"
                    style={{ color: colors.secondary }}
                  >
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </section>
  );
};

export default MessageList;
