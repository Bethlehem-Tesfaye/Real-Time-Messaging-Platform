import { ChevronRight, Crown } from "lucide-react";
import { colors } from "../../../config/theme";
import type { RoomMemberItem } from "../types/chat";

type RoomDetailsSidebarProps = {
  roomName?: string;
  roomAvatarUrl?: string | null;
  ownerName?: string;
  ownerId?: string;
  participantCount: number;
  members?: RoomMemberItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const RoomDetailsSidebar = ({
  roomName,
  roomAvatarUrl,
  ownerName,
  ownerId,
  participantCount,
  members = [],
  collapsed,
  onToggleCollapse,
}: RoomDetailsSidebarProps) => {
  const roomInitial = roomName?.trim().charAt(0).toUpperCase() || "R";
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === ownerId && b.id !== ownerId) {
      return -1;
    }

    if (b.id === ownerId && a.id !== ownerId) {
      return 1;
    }

    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <aside
      className={`rounded-3xl p-4 transition-all duration-200 ${
        collapsed
          ? "hidden lg:block lg:w-14 xl:w-16"
          : "w-full lg:w-72 xl:w-80 2xl:w-88"
      }`}
      style={{
        borderColor: `${colors.secondary}20`,
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <h2
            className="text-[1.95rem] font-extrabold tracking-tight xl:text-[2.1rem]"
            style={{ color: colors.primary }}
          >
            Room details
          </h2>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="grid h-9 w-12 cursor-pointer place-items-center rounded-xl"
          style={{
            backgroundColor: `${colors.secondary}14`,
            color: colors.primary,
          }}
          aria-label={
            collapsed ? "Expand details sidebar" : "Collapse details sidebar"
          }
        >
          <ChevronRight
            className={`h-6 w-6 transition-transform cursor-pointer ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {!collapsed && (
        <div className="mt-6 space-y-4">
          <div
            className="rounded-2xl border px-4 py-5"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: `${colors.bg}5C`,
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="grid h-30 w-30 place-items-center overflow-hidden rounded-full border text-2xl font-extrabold"
                style={{
                  borderColor: `${colors.secondary}33`,
                  backgroundColor: `${colors.bg}99`,
                  color: colors.primary,
                }}
              >
                {roomAvatarUrl ? (
                  <img
                    src={roomAvatarUrl}
                    alt={`${roomName ?? "Room"} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  roomInitial
                )}
              </div>

              <p
                className="mt-3 text-[1.45rem] font-extrabold leading-tight"
                style={{ color: colors.primary }}
              >
                {roomName ?? "No room selected"}
              </p>
              <p className="mt-1 text-sm" style={{ color: colors.secondary }}>
                {participantCount} members
              </p>
            </div>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: `${colors.bg}5C`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: colors.secondary }}
            >
              Owner
            </p>
            <div
              className="mt-1 flex items-center gap-2"
              style={{ color: colors.primary }}
            >
              <Crown className="h-4 w-4" style={{ color: colors.notify }} />
              <p className="text-base font-bold xl:text-[1.05rem]">
                {ownerName ?? "—"}
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border p-4"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: `${colors.bg}5C`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: colors.secondary }}
            >
              Members
            </p>

            {sortedMembers.length > 0 ? (
              <div className="mt-3 space-y-2">
                {sortedMembers.map((member) => {
                  const memberInitial =
                    member.displayName.trim().charAt(0).toUpperCase() || "U";
                  const isOwner = member.id === ownerId;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                      style={{ backgroundColor: "#FFFFFF" }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: `${colors.secondary}14`,
                            color: colors.primary,
                          }}
                        >
                          {memberInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="truncate text-sm font-semibold"
                              style={{ color: colors.primary }}
                            >
                              {member.displayName}
                            </p>
                            {isOwner && (
                              <Crown
                                className="h-3.5 w-3.5 shrink-0"
                                style={{ color: colors.notify }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: member.isOnline
                            ? colors.online
                            : `${colors.secondary}66`,
                        }}
                        aria-label={member.isOnline ? "Online" : "Offline"}
                        title={member.isOnline ? "Online" : "Offline"}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm" style={{ color: colors.secondary }}>
                No members yet.
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default RoomDetailsSidebar;
