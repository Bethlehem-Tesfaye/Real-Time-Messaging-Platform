import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../config/theme";
import { bg2 } from "../../assets";
import Logo from "../../components/logo";
import { useMyProfile } from "../../features/profile/hooks/useMyProfile";
import { useUpsertProfile } from "../../features/profile/hooks/useUpsertProfile";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const upsertProfileMutation = useUpsertProfile();

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

    const savedProfile = await upsertProfileMutation.mutateAsync({
      username: username.trim(),
      displayName: displayName.trim(),
      bio,
      avatar: avatarFile,
      removeAvatar,
    });

    if (savedProfile.isComplete) {
      navigate("/chat");
    }
  };

  // if (isLoading) {
  //   return (
  //     <div
  //       className="grid min-h-screen place-items-center"
  //       style={{ color: colors.secondary }}
  //     >
  //       Loading profile...
  //     </div>
  //   );
  // }

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-8"
      style={{
        backgroundColor: colors.bg,
        backgroundImage: `url(${bg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="px-2 pb-4 md:px-4 md:pb-6">
        <div className="inline-flex items-center gap-2 px-1 py-1">
          <Logo />
        </div>
      </div>

      <div
        className="mx-auto w-full max-w-2xl rounded-3xl border p-4 sm:p-6 md:p-8"
        style={{
          borderColor: `${colors.secondary}33`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <h1
          className="text-2xl font-extrabold sm:text-3xl"
          style={{ color: colors.primary }}
        >
          Complete your profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.secondary }}>
          Add your profile details to continue to chat.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
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

          <div>
            <label
              className="mb-1 block text-sm font-semibold"
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
              className="mb-1 block text-sm font-semibold"
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

          <div>
            <label
              className="mb-1 block text-sm font-semibold"
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

          <button
            type="submit"
            disabled={upsertProfileMutation.isPending}
            className="h-11 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            {upsertProfileMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
