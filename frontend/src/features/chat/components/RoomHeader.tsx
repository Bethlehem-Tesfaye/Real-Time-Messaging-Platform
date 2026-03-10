import { colors } from "../../../config/theme";

type RoomHeaderProps = {
  roomName: string;
  memberCount: number;
  memberCountLoading: boolean;
  onOpenRooms?: () => void;
  onOpenDetails?: () => void;
};

const RoomHeader = ({
  roomName,
  memberCount,
  memberCountLoading,
  onOpenRooms,
  onOpenDetails,
}: RoomHeaderProps) => {
  return (
    <header
      className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4"
      style={{ borderColor: `${colors.secondary}20` }}
    >
      <div className="min-w-0">
        <h1
          className="truncate text-2xl font-extrabold tracking-tight sm:text-[2rem] xl:text-[2.2rem]"
          style={{ color: colors.primary }}
        >
          {roomName}
        </h1>
        {memberCountLoading ? (
          <div
            className="mt-1 h-4 w-24 animate-pulse rounded"
            style={{ backgroundColor: `${colors.secondary}22` }}
            aria-label="Loading member count"
          />
        ) : (
          <p className="text-xs sm:text-sm" style={{ color: colors.secondary }}>
            {memberCount} members
          </p>
        )}
      </div>

      <div className="ml-3 flex items-center gap-2 xl:gap-3">
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
      </div>
    </header>
  );
};

export default RoomHeader;
