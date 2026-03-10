import {
  ChevronRight,
  Crown,
  File,
  Folder,
  Image,
  Link2,
  Video,
} from "lucide-react";
import { colors } from "../../../config/theme";

type RoomDetailsSidebarProps = {
  roomName?: string;
  roomAvatarUrl?: string | null;
  ownerName?: string;
  participantCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const RoomDetailsSidebar = ({
  roomName,
  roomAvatarUrl,
  ownerName,
  participantCount,
  collapsed,
  onToggleCollapse,
}: RoomDetailsSidebarProps) => {
  const roomInitial = roomName?.trim().charAt(0).toUpperCase() || "R";

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
        </div>
      )}
    </aside>
  );
};

export default RoomDetailsSidebar;
