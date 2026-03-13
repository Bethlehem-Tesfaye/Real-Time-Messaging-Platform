import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { colors } from "../../../config/theme";
import type { ChatMessage } from "../types/chat";

type MessageListProps = {
  roomId?: number;
  messages: ChatMessage[];
  currentUserId?: string;
  loading: boolean;
  showJoinPrompt: boolean;
  unreadMessageIds?: number[];
  forceScrollToBottomSignal?: number;
  targetMessageId?: number | null;
  onTargetMessageHandled?: () => void;
  onMessagesRead?: (messageIds: number[]) => void;
};

const MessageList = ({
  roomId,
  messages,
  currentUserId,
  loading,
  showJoinPrompt,
  unreadMessageIds = [],
  forceScrollToBottomSignal,
  targetMessageId,
  onTargetMessageHandled,
  onMessagesRead,
}: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement>());
  const unreadMessageIdsRef = useRef<Set<number>>(new Set());
  const lastSeenMessageIdRef = useRef<number | null>(null);
  const latestNearBottomRef = useRef(true);
  const previousRoomIdRef = useRef<number | undefined>(roomId);
  const roomScrollTopByIdRef = useRef<Map<number, number>>(new Map());
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<
    number | null
  >(null);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      ),
    [messages],
  );

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= 100;
  };

  const syncUnreadUi = () => {
    const unreadIds = Array.from(unreadMessageIdsRef.current).sort(
      (a, b) => a - b,
    );
    setUnreadCount(unreadIds.length);
    setFirstUnreadMessageId(unreadIds[0] ?? null);
  };

  useEffect(() => {
    if (!loading) {
      const nearBottom = isNearBottom();
      latestNearBottomRef.current = nearBottom;
      setShowScrollToBottom(!nearBottom);
    }
  }, [loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => {
      if (typeof roomId === "number") {
        roomScrollTopByIdRef.current.set(roomId, container.scrollTop);
      }

      const nearBottom = isNearBottom();
      latestNearBottomRef.current = nearBottom;
      setShowScrollToBottom(!nearBottom);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const previousRoomId = previousRoomIdRef.current;

    if (container && typeof previousRoomId === "number") {
      roomScrollTopByIdRef.current.set(previousRoomId, container.scrollTop);
    }

    previousRoomIdRef.current = roomId;

    unreadMessageIdsRef.current.clear();
    lastSeenMessageIdRef.current = null;
    syncUnreadUi();

    requestAnimationFrame(() => {
      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      const savedScrollTop =
        typeof roomId === "number"
          ? roomScrollTopByIdRef.current.get(roomId)
          : undefined;
      if (typeof savedScrollTop === "number") {
        currentContainer.scrollTo({ top: savedScrollTop, behavior: "auto" });
      }

      requestAnimationFrame(() => {
        const nearBottom = isNearBottom();
        latestNearBottomRef.current = nearBottom;
        setShowScrollToBottom(!nearBottom);
      });
    });
  }, [roomId]);

  useEffect(() => {
    if (!sortedMessages.length || unreadMessageIds.length === 0) {
      return;
    }

    const existingMessageIds = new Set(
      sortedMessages.map((message) => message.id),
    );
    let changed = false;

    unreadMessageIds.forEach((messageId) => {
      if (!existingMessageIds.has(messageId)) {
        return;
      }

      if (!unreadMessageIdsRef.current.has(messageId)) {
        unreadMessageIdsRef.current.add(messageId);
        changed = true;
      }
    });

    if (changed) {
      syncUnreadUi();
      setShowScrollToBottom(true);
    }
  }, [sortedMessages, unreadMessageIds]);

  useEffect(() => {
    if (!sortedMessages.length) {
      unreadMessageIdsRef.current.clear();
      syncUnreadUi();
      lastSeenMessageIdRef.current = null;
      return;
    }

    const previousLastId = lastSeenMessageIdRef.current;
    const latestMessage = sortedMessages[sortedMessages.length - 1];
    const latestMessageId = latestMessage.id;

    if (previousLastId === null) {
      lastSeenMessageIdRef.current = latestMessageId;
      return;
    }

    if (latestMessageId === previousLastId) {
      return;
    }

    const newlyArrived = sortedMessages.filter(
      (message) => message.id > previousLastId,
    );
    const userSentNewMessage = newlyArrived.some(
      (message) => message.senderId === currentUserId,
    );

    if (userSentNewMessage) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } else if (latestNearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } else {
      newlyArrived.forEach((message) => {
        unreadMessageIdsRef.current.add(message.id);
      });
      syncUnreadUi();
      setShowScrollToBottom(true);
    }

    lastSeenMessageIdRef.current = latestMessageId;
  }, [sortedMessages, currentUserId]);

  useEffect(() => {
    if (!forceScrollToBottomSignal) {
      return;
    }

    requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [forceScrollToBottomSignal]);

  useEffect(() => {
    if (!targetMessageId) {
      return;
    }

    const targetElement = messageRefs.current.get(targetMessageId);
    if (!targetElement) {
      return;
    }

    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

    const readIds: number[] = [];
    unreadMessageIdsRef.current.forEach((id) => {
      if (id <= targetMessageId) {
        readIds.push(id);
        unreadMessageIdsRef.current.delete(id);
      }
    });

    if (readIds.length > 0) {
      syncUnreadUi();
      onMessagesRead?.(readIds);
    }

    onTargetMessageHandled?.();
  }, [targetMessageId, sortedMessages, onMessagesRead, onTargetMessageHandled]);

  useEffect(() => {
    if (!sortedMessages.length || showJoinPrompt) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const readIds: number[] = [];

        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLDivElement;
          const messageId = Number(element.dataset.messageId);
          if (Number.isNaN(messageId)) {
            return;
          }

          if (unreadMessageIdsRef.current.has(messageId)) {
            unreadMessageIdsRef.current.delete(messageId);
            readIds.push(messageId);
          }
        });

        if (readIds.length > 0) {
          syncUnreadUi();
          onMessagesRead?.(readIds);
        }
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      },
    );

    messageRefs.current.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [sortedMessages, showJoinPrompt, onMessagesRead]);

  if (loading) {
    return (
      <section className="relative flex-1 p-6">
        <p style={{ color: colors.secondary }}>Loading messages...</p>
      </section>
    );
  }

  if (showJoinPrompt) {
    return (
      <section className="relative flex-1 p-6">
        <div className="grid h-full place-items-center">
          <p className="text-sm" style={{ color: colors.secondary }}>
            Join this room to view message history.
          </p>
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
    <section className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="h-full min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <div className="space-y-4">
          {sortedMessages.map((message) => {
            const mine = message.senderId === currentUserId;
            const senderInitial =
              message.senderName.trim().charAt(0).toUpperCase() || "U";

            return (
              <div key={message.id} className="space-y-2">
                {firstUnreadMessageId === message.id && (
                  <div className="flex items-center gap-2 px-1">
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: `${colors.notify}66` }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: colors.notify }}
                    >
                      Unread Messages
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ backgroundColor: `${colors.notify}66` }}
                    />
                  </div>
                )}

                <div
                  ref={(element) => {
                    if (!element) {
                      messageRefs.current.delete(message.id);
                      return;
                    }

                    messageRefs.current.set(message.id, element);
                  }}
                  data-message-id={message.id}
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
                      backgroundColor: mine
                        ? `${colors.secondary}CC`
                        : "#FFFFFF",
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
              </div>
            );
          })}
        </div>
      </div>

      {showScrollToBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-end pr-4">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="pointer-events-auto flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-md"
            style={{ backgroundColor: colors.secondary }}
            aria-label="Scroll to newest messages"
          >
            <ChevronDown className="h-4 w-4" />
            {unreadCount > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                style={{ backgroundColor: colors.notify }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default MessageList;
