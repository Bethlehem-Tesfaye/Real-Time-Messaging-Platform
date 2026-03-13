import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ChevronLeft, MoreHorizontal, Plus } from "lucide-react";
import { colors } from "../../../config/theme";
import type { RoomListItem } from "../types/chat";

type RoomTab = "all" | "created" | "member";

type GroupsSidebarProps = {
  rooms: RoomListItem[];
  roomsLoading: boolean;
  selectedRoomId?: number;
  currentUserId?: string;
  activeTab: RoomTab;
  searchQuery: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectRoom: (roomId: number) => void;
  onTabChange: (tab: RoomTab) => void;
  onSearchQueryChange: (value: string) => void;
  onCreateRoom: (payload: {
    name: string;
    is_private: boolean;
    avatar?: File | null;
  }) => Promise<void>;
  onUpdateRoom: (payload: {
    id: number;
    name?: string;
    is_private?: boolean;
    avatar?: File | null;
    removeAvatar?: boolean;
  }) => Promise<void>;
  onDeleteRoom: (roomId: number) => Promise<void>;
  onLeaveRoom: (roomId: number) => Promise<void>;
  creatingRoom: boolean;
  updatingRoom: boolean;
  deletingRoom: boolean;
  leavingRoom: boolean;
};

const GroupsSidebar = ({
  rooms,
  roomsLoading,
  selectedRoomId,
  currentUserId,
  activeTab,
  searchQuery,
  collapsed,
  onToggleCollapse,
  onSelectRoom,
  onTabChange,
  onSearchQueryChange,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onLeaveRoom,
  creatingRoom,
  updatingRoom,
  deletingRoom,
  leavingRoom,
}: GroupsSidebarProps) => {
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [openMenuRoomId, setOpenMenuRoomId] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomListItem | null>(null);
  const [confirmDeleteRoom, setConfirmDeleteRoom] =
    useState<RoomListItem | null>(null);
  const [confirmLeaveRoom, setConfirmLeaveRoom] = useState<RoomListItem | null>(
    null,
  );

  const [roomName, setRoomName] = useState("");
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [roomAvatarFile, setRoomAvatarFile] = useState<File | null>(null);

  const [editRoomName, setEditRoomName] = useState("");
  const [editIsPrivateRoom, setEditIsPrivateRoom] = useState(false);
  const [editRoomAvatarFile, setEditRoomAvatarFile] = useState<File | null>(
    null,
  );
  const [removeEditAvatar, setRemoveEditAvatar] = useState(false);

  const roomAvatarPreviewUrl = useMemo(() => {
    if (!roomAvatarFile) {
      return null;
    }

    return URL.createObjectURL(roomAvatarFile);
  }, [roomAvatarFile]);

  const filteredRooms = rooms;

  const editRoomAvatarPreviewUrl = useMemo(() => {
    if (editRoomAvatarFile) {
      return URL.createObjectURL(editRoomAvatarFile);
    }

    if (removeEditAvatar) {
      return null;
    }

    const existingAvatarUrl =
      typeof editingRoom?.avatarUrl === "string"
        ? editingRoom.avatarUrl.trim()
        : "";

    return existingAvatarUrl.length > 0 ? existingAvatarUrl : null;
  }, [editRoomAvatarFile, editingRoom?.avatarUrl, removeEditAvatar]);

  useEffect(() => {
    if (!openMenuRoomId) {
      return;
    }

    const onClickOutsideMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-room-menu]")) {
        setOpenMenuRoomId(null);
      }
    };

    document.addEventListener("mousedown", onClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", onClickOutsideMenu);
    };
  }, [openMenuRoomId]);

  const getRoomInitial = (name: string) => {
    const trimmedName = name.trim();
    return trimmedName.length > 0 ? trimmedName[0].toUpperCase() : "?";
  };

  const onRoomAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setRoomAvatarFile(file);
  };

  const onEditRoomAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setEditRoomAvatarFile(file);

    if (file) {
      setRemoveEditAvatar(false);
    }
  };

  const submitCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = roomName.trim();

    if (!trimmedName) return;

    await onCreateRoom({
      name: trimmedName,
      is_private: isPrivateRoom,
      avatar: roomAvatarFile,
    });

    setRoomName("");
    setIsPrivateRoom(false);
    setRoomAvatarFile(null);
    setShowCreateBox(false);
  };

  const openEditRoomModal = (room: RoomListItem) => {
    setEditingRoom(room);
    setEditRoomName(room.name);
    setEditIsPrivateRoom(room.is_private);
    setEditRoomAvatarFile(null);
    setRemoveEditAvatar(false);
    setOpenMenuRoomId(null);
  };

  const closeEditRoomModal = () => {
    setEditingRoom(null);
    setEditRoomAvatarFile(null);
    setRemoveEditAvatar(false);
  };

  const submitEditRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingRoom) {
      return;
    }

    const trimmedName = editRoomName.trim();
    if (!trimmedName) {
      return;
    }

    await onUpdateRoom({
      id: editingRoom.id,
      name: trimmedName,
      is_private: editIsPrivateRoom,
      avatar: editRoomAvatarFile,
      removeAvatar: removeEditAvatar,
    });

    closeEditRoomModal();
  };

  const handleDeleteRoom = async (roomId: number) => {
    setOpenMenuRoomId(null);
    await onDeleteRoom(roomId);
    setConfirmDeleteRoom(null);
  };

  const handleLeaveRoom = async (roomId: number) => {
    setOpenMenuRoomId(null);
    await onLeaveRoom(roomId);
    setConfirmLeaveRoom(null);
  };

  return (
    <aside
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl p-4 transition-all duration-300 ease-in-out ${
        collapsed
          ? "hidden lg:flex lg:w-28 xl:w-30"
          : "w-full lg:w-80 xl:w-90 2xl:w-96"
      }`}
      style={{
        borderColor: `${colors.secondary}20`,
        backgroundColor: "#FFFFFF",
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          className={`text-[2rem] font-extrabold tracking-tight transition-all duration-300 xl:text-[2.15rem] ${
            collapsed
              ? "max-w-0 -translate-x-2 opacity-0"
              : "max-w-50 translate-x-0 opacity-100"
          }`}
          style={{ color: colors.primary }}
        >
          Rooms
        </h2>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="grid h-9 w-12 cursor-pointer place-items-center rounded-xl"
          style={{
            backgroundColor: `${colors.secondary}14`,
            color: colors.primary,
          }}
          aria-label={
            collapsed ? "Expand groups sidebar" : "Collapse groups sidebar"
          }
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform cursor-pointer ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div className="relative mt-1 flex-1 min-h-0">
        <div
          className={`transition-all ease-in-out ${
            collapsed
              ? "pointer-events-none absolute inset-0 translate-x-3 opacity-0 duration-180"
              : "relative flex h-full min-h-0 flex-col translate-x-0 opacity-100 delay-75 duration-280"
          }`}
        >
          <p
            className="text-sm xl:text-[0.95rem]"
            style={{ color: `${colors.secondary}B8` }}
          >
            Select a group room to start chatting.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onTabChange("all")}
              className="h-9 rounded-xl text-xs font-semibold transition"
              style={{
                color: activeTab === "all" ? colors.primary : colors.secondary,
                border: `1px solid ${
                  activeTab === "all"
                    ? `${colors.online}66`
                    : `${colors.secondary}33`
                }`,
                backgroundColor:
                  activeTab === "all" ? `${colors.online}1A` : "#FFFFFF",
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onTabChange("created")}
              className="h-9 rounded-xl text-xs font-semibold transition"
              style={{
                color:
                  activeTab === "created" ? colors.primary : colors.secondary,
                border: `1px solid ${
                  activeTab === "created"
                    ? `${colors.online}66`
                    : `${colors.secondary}33`
                }`,
                backgroundColor:
                  activeTab === "created" ? `${colors.online}1A` : "#FFFFFF",
              }}
            >
              Created
            </button>
            <button
              type="button"
              onClick={() => onTabChange("member")}
              className="h-9 rounded-xl text-xs font-semibold transition"
              style={{
                color:
                  activeTab === "member" ? colors.primary : colors.secondary,
                border: `1px solid ${
                  activeTab === "member"
                    ? `${colors.online}66`
                    : `${colors.secondary}33`
                }`,
                backgroundColor:
                  activeTab === "member" ? `${colors.online}1A` : "#FFFFFF",
              }}
            >
              Member
            </button>
          </div>

          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search rooms..."
            className="mt-3 h-10 w-full rounded-xl border px-3 text-sm outline-none"
            style={{
              borderColor: `${colors.secondary}33`,
              backgroundColor: `${colors.bg}80`,
              color: colors.primary,
            }}
          />

          <div className="mt-5 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {roomsLoading ? (
              <p className="text-sm" style={{ color: colors.secondary }}>
                Loading groups...
              </p>
            ) : filteredRooms.length === 0 ? (
              <p className="text-sm" style={{ color: colors.secondary }}>
                {activeTab === "created"
                  ? "No created groups yet."
                  : activeTab === "member"
                    ? "No member groups yet."
                    : "No groups yet. Create one."}
              </p>
            ) : (
              filteredRooms.map((room) => {
                const isActive = selectedRoomId === room.id;
                const isOwner = currentUserId === room.ownerId;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onSelectRoom(room.id)}
                    className="w-full rounded-2xl border px-3 py-3 text-left transition"
                    style={{
                      borderColor: isActive
                        ? `${colors.online}80`
                        : `${colors.secondary}20`,
                      backgroundColor: isActive
                        ? `${colors.online}12`
                        : `${colors.bg}4D`,
                      color: colors.primary,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border text-sm font-bold"
                        style={{
                          borderColor: `${colors.secondary}33`,
                          backgroundColor: `${colors.bg}99`,
                          color: colors.primary,
                        }}
                      >
                        {room.avatarUrl ? (
                          <img
                            src={room.avatarUrl}
                            alt={`${room.name} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getRoomInitial(room.name)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-[1.08rem] font-semibold xl:text-[1.16rem]">
                              {room.name}
                            </span>
                            <span
                              className="shrink-0 text-[11px] font-semibold"
                              style={{
                                color: room.is_private
                                  ? colors.notify
                                  : colors.online,
                              }}
                            >
                              {room.is_private ? "Private" : "Public"}
                            </span>
                          </div>

                          <div className="relative" data-room-menu>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuRoomId((prev) =>
                                  prev === room.id ? null : room.id,
                                );
                              }}
                              className="grid h-8 w-8 place-items-center rounded-lg"
                              style={{
                                backgroundColor: `${colors.secondary}14`,
                                color: colors.primary,
                              }}
                              aria-label="Room actions"
                            >
                              <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                            </button>

                            {openMenuRoomId === room.id && (
                              <div
                                className="absolute top-9 right-0 z-30 w-36 rounded-xl border p-1.5 shadow-md"
                                style={{
                                  borderColor: `${colors.secondary}25`,
                                  backgroundColor: "#FFFFFF",
                                }}
                              >
                                {isOwner ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openEditRoomModal(room);
                                      }}
                                      className="w-full rounded-lg px-2 py-2 text-left text-sm"
                                      style={{ color: colors.primary }}
                                    >
                                      Edit group
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenMenuRoomId(null);
                                        setConfirmDeleteRoom(room);
                                      }}
                                      disabled={deletingRoom}
                                      className="w-full rounded-lg px-2 py-2 text-left text-sm disabled:opacity-60"
                                      style={{ color: colors.notify }}
                                    >
                                      {deletingRoom ? "Deleting..." : "Delete"}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenMenuRoomId(null);
                                      setConfirmLeaveRoom(room);
                                    }}
                                    disabled={leavingRoom}
                                    className="w-full rounded-lg px-2 py-2 text-left text-sm disabled:opacity-60"
                                    style={{ color: colors.notify }}
                                  >
                                    {leavingRoom ? "Leaving..." : "Leave room"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className={`transition-all ease-in-out ${
            collapsed
              ? "relative h-full min-h-0 pt-14 pb-16 translate-x-0 opacity-100 delay-120 duration-280"
              : "pointer-events-none absolute inset-0 -translate-x-3 opacity-0 duration-180"
          }`}
        >
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="flex flex-col items-center gap-2.5">
              {filteredRooms.map((room) => {
                const isActive = selectedRoomId === room.id;

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => onSelectRoom(room.id)}
                    className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border text-lg font-bold transition"
                    style={{
                      borderColor: isActive
                        ? `${colors.online}B3`
                        : `${colors.secondary}33`,
                      backgroundColor: isActive
                        ? `${colors.online}22`
                        : `${colors.bg}80`,
                      color: colors.primary,
                    }}
                    title={room.name}
                    aria-label={room.name}
                  >
                    {room.avatarUrl ? (
                      <img
                        src={room.avatarUrl}
                        alt={`${room.name} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getRoomInitial(room.name)
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCreateBox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={() => setShowCreateBox(false)}
          role="presentation"
        >
          <form
            onSubmit={submitCreateRoom}
            className="w-full max-w-md rounded-2xl border p-4 shadow-lg"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: "#fff",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              className="mb-3 text-lg font-bold"
              style={{ color: colors.primary }}
            >
              Create room
            </h3>

            <div className="mb-3 flex items-center gap-3">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border text-base font-bold"
                style={{
                  borderColor: `${colors.secondary}33`,
                  backgroundColor: `${colors.bg}99`,
                  color: colors.primary,
                }}
              >
                {roomAvatarPreviewUrl ? (
                  <img
                    src={roomAvatarPreviewUrl}
                    alt="Room avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getRoomInitial(roomName)
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={onRoomAvatarChange}
                className="text-sm"
                style={{ color: colors.primary }}
              />
            </div>

            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Room name"
              className="h-10 w-full rounded-xl border px-3 text-sm outline-none"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: `${colors.bg}80`,
                color: colors.primary,
              }}
            />
            <label
              className="mt-3 flex items-center gap-2 text-xs"
              style={{ color: colors.secondary }}
            >
              <input
                type="checkbox"
                checked={isPrivateRoom}
                onChange={(event) => setIsPrivateRoom(event.target.checked)}
              />
              Private Room
            </label>
            <button
              type="submit"
              disabled={creatingRoom}
              className="mt-4 h-10 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: colors.primary }}
            >
              {creatingRoom ? "Creating..." : "Create room"}
            </button>
          </form>
        </div>
      )}

      {editingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={closeEditRoomModal}
          role="presentation"
        >
          <form
            onSubmit={submitEditRoom}
            className="w-full max-w-md rounded-2xl border p-4 shadow-lg"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: "#fff",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              className="mb-3 text-lg font-bold"
              style={{ color: colors.primary }}
            >
              Edit group
            </h3>

            <div className="mb-3 flex items-center gap-3">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border text-base font-bold"
                style={{
                  borderColor: `${colors.secondary}33`,
                  backgroundColor: `${colors.bg}99`,
                  color: colors.primary,
                }}
              >
                {editRoomAvatarPreviewUrl ? (
                  <img
                    src={editRoomAvatarPreviewUrl}
                    alt="Room avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getRoomInitial(editRoomName)
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onEditRoomAvatarChange}
                  className="text-sm"
                  style={{ color: colors.primary }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditRoomAvatarFile(null);
                    setRemoveEditAvatar(true);
                  }}
                  className="text-xs font-semibold"
                  style={{ color: colors.accent }}
                >
                  Remove avatar
                </button>
              </div>
            </div>

            <input
              value={editRoomName}
              onChange={(event) => setEditRoomName(event.target.value)}
              placeholder="Room name"
              className="h-10 w-full rounded-xl border px-3 text-sm outline-none"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: `${colors.bg}80`,
                color: colors.primary,
              }}
            />
            <label
              className="mt-3 flex items-center gap-2 text-xs"
              style={{ color: colors.secondary }}
            >
              <input
                type="checkbox"
                checked={editIsPrivateRoom}
                onChange={(event) => setEditIsPrivateRoom(event.target.checked)}
              />
              Private Room
            </label>
            <button
              type="submit"
              disabled={updatingRoom}
              className="mt-4 h-10 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: colors.primary }}
            >
              {updatingRoom ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {confirmDeleteRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={() => setConfirmDeleteRoom(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-4 shadow-lg"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: "#fff",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold" style={{ color: colors.primary }}>
              Delete group?
            </h3>
            <p className="mt-2 text-sm" style={{ color: colors.secondary }}>
              This will permanently delete
              <span className="font-semibold" style={{ color: colors.primary }}>
                {` ${confirmDeleteRoom.name}`}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRoom(null)}
                className="h-9 rounded-lg border px-3 text-sm font-semibold"
                style={{
                  borderColor: `${colors.secondary}33`,
                  color: colors.primary,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteRoom(confirmDeleteRoom.id)}
                disabled={deletingRoom}
                className="h-9 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: colors.notify }}
              >
                {deletingRoom ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLeaveRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={() => setConfirmLeaveRoom(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-4 shadow-lg"
            style={{
              borderColor: `${colors.secondary}20`,
              backgroundColor: "#fff",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold" style={{ color: colors.primary }}>
              Leave room?
            </h3>
            <p className="mt-2 text-sm" style={{ color: colors.secondary }}>
              You are about to leave
              <span className="font-semibold" style={{ color: colors.primary }}>
                {` ${confirmLeaveRoom.name}`}
              </span>
              .
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmLeaveRoom(null)}
                className="h-9 rounded-lg border px-3 text-sm font-semibold"
                style={{
                  borderColor: `${colors.secondary}33`,
                  color: colors.primary,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleLeaveRoom(confirmLeaveRoom.id)}
                disabled={leavingRoom}
                className="h-9 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: colors.notify }}
              >
                {leavingRoom ? "Leaving..." : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowCreateBox((prev) => !prev)}
        className={`absolute bottom-4 grid h-11 w-11 place-items-center rounded-full text-white shadow-md transition-all duration-300 ease-in-out ${
          collapsed ? "left-1/2 -translate-x-1/2" : "right-4"
        }`}
        style={{ backgroundColor: colors.online }}
        aria-label="Create room"
      >
        <Plus className="h-5 w-5" />
      </button>
    </aside>
  );
};

export default GroupsSidebar;
