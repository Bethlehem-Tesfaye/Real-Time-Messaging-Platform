import { BarChart3, MessageSquare, Settings, UserCircle2 } from "lucide-react";
import { colors } from "../../../config/theme";
import Logo from "../../../components/logo";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useMyProfile } from "../../profile/hooks/useMyProfile";
import { NavLink } from "react-router-dom";

const ChatNavRail = () => {
  const { user } = useCurrentUser();
  const { data: profile } = useMyProfile();
  const profileImage = profile?.avatarUrl ?? user?.image ?? null;

  const tabs: Array<{
    key: "rooms" | "analytics" | "settings";
    label: string;
    icon: typeof MessageSquare;
    to: string;
  }> = [
    { key: "rooms", label: "Rooms", icon: MessageSquare, to: "/chat" },
    {
      key: "analytics",
      label: "Analytics",
      icon: BarChart3,
      to: "/analytics",
    },
    { key: "settings", label: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <aside
      className="flex w-18 shrink-0 flex-col items-center border-r-2 py-4"
      style={{
        borderColor: `${colors.secondary}1C`,
        backgroundColor: "#FFFFFF",
      }}
      aria-label="Chat navigation"
    >
      <div className="mb-6">
        <Logo iconOnly />
      </div>

      <div className="mt-1 flex flex-1 flex-col items-center gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.key}
              to={tab.to}
              className="relative grid h-10 w-10 place-items-center rounded-xl transition"
              style={({ isActive }) => ({
                backgroundColor: isActive
                  ? `${colors.online}22`
                  : "transparent",
                color: isActive ? colors.online : `${colors.secondary}8F`,
              })}
              aria-label={tab.label}
              title={tab.label}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <span
                      className="absolute -right-1.75 h-7 w-0.75 rounded-full"
                      style={{ backgroundColor: colors.online }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <NavLink
        to="/account"
        className="grid h-10 w-10 place-items-center rounded-full"
        style={({ isActive }) => ({
          backgroundColor: isActive
            ? `${colors.online}22`
            : `${colors.secondary}14`,
          color: isActive ? colors.online : colors.primary,
        })}
        aria-label="Account"
        title="Account"
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="Account"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <UserCircle2 className="h-7 w-7" />
        )}
      </NavLink>
    </aside>
  );
};

export default ChatNavRail;
