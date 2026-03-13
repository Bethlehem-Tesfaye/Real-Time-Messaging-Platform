import { Bell } from "lucide-react";
import { colors } from "../../../config/theme";
import type { NotificationItem } from "../types/notification";

type NotificationBellProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  markingAllRead: boolean;
};

const getNotificationText = (notification: NotificationItem) => {
  const sender = notification.data.senderName ?? "Someone";
  const roomLabel =
    typeof notification.data.roomId === "number"
      ? `room #${notification.data.roomId}`
      : "a room";

  if (notification.type === "mention") {
    return `${sender} mentioned you in ${roomLabel}`;
  }

  if (notification.type === "room_invite") {
    return `${sender} invited you to ${roomLabel}`;
  }

  return `New message from ${sender} in ${roomLabel}`;
};

const NotificationBell = ({
  notifications,
  unreadCount,
  open,
  onToggle,
  onMarkAllRead,
  onNotificationClick,
  markingAllRead,
}: NotificationBellProps) => {
  return (
    <div className="relative" data-notification-panel>
      <button
        type="button"
        onClick={onToggle}
        className="relative grid h-10 w-10 place-items-center rounded-xl"
        style={{
          backgroundColor: `${colors.secondary}16`,
          color: colors.primary,
        }}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[1.1rem] rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
            style={{ backgroundColor: colors.notify }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-12 right-0 z-40 w-[min(92vw,22rem)] rounded-2xl border bg-white p-2 shadow-lg"
          style={{ borderColor: `${colors.secondary}22` }}
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <p
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              Notifications
            </p>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={markingAllRead || unreadCount === 0}
              className="text-xs font-semibold disabled:opacity-60"
              style={{ color: colors.online }}
            >
              {markingAllRead ? "Marking..." : "Mark all read"}
            </button>
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto p-1">
            {notifications.length === 0 ? (
              <p
                className="px-2 py-3 text-sm"
                style={{ color: colors.secondary }}
              >
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onNotificationClick(notification)}
                  className="w-full rounded-xl px-2 py-2 text-left transition"
                  style={{
                    backgroundColor: notification.read
                      ? "transparent"
                      : `${colors.online}14`,
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.primary }}
                  >
                    {getNotificationText(notification)}
                  </p>
                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: colors.secondary }}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
