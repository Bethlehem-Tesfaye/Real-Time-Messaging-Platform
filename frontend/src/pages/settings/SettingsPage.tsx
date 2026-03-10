import { colors } from "../../config/theme";
import ChatNavRail from "../../features/chat/components/ChatNavRail";

const SettingsPage = () => {
  return (
    <div className="h-screen w-full" style={{ backgroundColor: colors.bg }}>
      <div
        className="flex h-full w-full flex-row"
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        <ChatNavRail />

        <main className="min-w-0 flex flex-1 items-start justify-center overflow-y-auto bg-gray-100 px-4 py-6 sm:px-6 sm:py-8">
          <div
            className="w-full max-w-2xl rounded-2xl border bg-white p-4 sm:p-6 md:p-8"
            style={{
              borderColor: `${colors.secondary}33`,
            }}
          >
            <h1
              className="text-2xl font-extrabold sm:text-3xl"
              style={{ color: colors.primary }}
            >
              Settings
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.secondary }}>
              Settings page is ready.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
