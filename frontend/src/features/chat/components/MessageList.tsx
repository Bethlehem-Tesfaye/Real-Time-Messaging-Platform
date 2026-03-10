import { useEffect, useMemo, useRef } from "react";
import { colors } from "../../../config/theme";
import type { ChatMessage } from "../types/chat";

type MessageListProps = {
  messages: ChatMessage[];
  currentUserId?: string;
  loading: boolean;
};

const MessageList = ({
  messages,
  currentUserId,
  loading,
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
      <section className="relative flex-1 p-6">
        <p style={{ color: colors.secondary }}>Loading messages...</p>
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
