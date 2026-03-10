import { colors } from "../../config/theme";
import AccountProfileForm from "../../features/account/components/AccountProfileForm";
import ChatNavRail from "../../features/chat/components/ChatNavRail";

const AccountPage = () => {
  return (
    <div className="h-screen w-full" style={{ backgroundColor: colors.bg }}>
      <div
        className="flex h-full w-full flex-row p-2"
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        <ChatNavRail />

        <main className="min-w-0 flex flex-1 overflow-y-auto bg-gray-100 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-5xl">
            <AccountProfileForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountPage;
