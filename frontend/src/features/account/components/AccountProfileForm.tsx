import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { UserCircle2 } from "lucide-react";
import { colors } from "../../../config/theme";
import { useLogout } from "../../auth/hooks/useLogout";
import { useMyProfile } from "../../profile/hooks/useMyProfile";
import { useUpsertProfile } from "../../profile/hooks/useUpsertProfile";

const AccountProfileForm = () => {
  const { data: profile } = useMyProfile();
  const upsertProfileMutation = useUpsertProfile();
  const logoutMutation = useLogout();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setUsername(profile.username ?? "");
    setDisplayName(profile.displayName ?? profile.name ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  const previewUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    if (removeAvatar) {
      return null;
    }

    const existingAvatarUrl =
      typeof profile?.avatarUrl === "string" ? profile.avatarUrl.trim() : "";

    return existingAvatarUrl.length > 0 ? existingAvatarUrl : null;
  }, [avatarFile, profile?.avatarUrl, removeAvatar]);

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) {
      setRemoveAvatar(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await upsertProfileMutation.mutateAsync({
      username: username.trim(),
      displayName: displayName.trim(),
      bio,
      avatar: avatarFile,
      removeAvatar,
    });
  };

  return (
    <section className="w-full px-1 sm:px-2 md:px-4">
      <div
        className="mb-8 border-b pb-5"
        style={{ borderColor: `${colors.secondary}22` }}
      >
        <h1
          className="text-2xl font-extrabold sm:text-3xl"
          style={{ color: colors.primary }}
        >
          Account settings
        </h1>
        <p className="mt-2 text-sm" style={{ color: colors.secondary }}>
          Edit your profile details.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div
          className="rounded-2xl border bg-white p-5 md:p-6"
          style={{ borderColor: `${colors.secondary}22` }}
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:gap-5">
            <div
              className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: `${colors.bg}80`,
              }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle2
                  className="h-14 w-14"
                  style={{ color: colors.secondary }}
                />
              )}
            </div>

            <div className="w-full space-y-2 text-black sm:w-auto">
              <input type="file" accept="image/*" onChange={onAvatarChange} />
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setRemoveAvatar(true);
                }}
                className="inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  color: colors.accent,
                  borderColor: `${colors.accent}55`,
                  backgroundColor: `${colors.accent}10`,
                }}
              >
                Remove avatar
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border bg-white p-5 md:p-6"
          style={{ borderColor: `${colors.secondary}22` }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                Username
              </label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="unique_username"
                className="h-11 w-full rounded-xl border px-3 text-sm outline-none"
                style={{
                  borderColor: `${colors.secondary}33`,
                  color: colors.primary,
                  backgroundColor: `${colors.bg}66`,
                }}
                required
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                Display name
              </label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your display name"
                className="h-11 w-full rounded-xl border px-3 text-sm outline-none"
                style={{
                  borderColor: `${colors.secondary}33`,
                  color: colors.primary,
                  backgroundColor: `${colors.bg}66`,
                }}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="mb-2 block text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                Bio (optional)
              </label>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Tell people about yourself"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: `${colors.secondary}33`,
                  color: colors.primary,
                  backgroundColor: `${colors.bg}66`,
                }}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-1 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="h-11 rounded-xl border px-6 text-sm font-semibold disabled:opacity-60"
            style={{
              borderColor: `${colors.secondary}44`,
              color: colors.secondary,
              backgroundColor: "#FFFFFF",
            }}
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </button>

          <button
            type="submit"
            disabled={
              upsertProfileMutation.isPending || logoutMutation.isPending
            }
            className="h-11 rounded-xl px-8 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            {upsertProfileMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AccountProfileForm;
