import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { useMyProfile } from "../features/profile/hooks/useMyProfile";
import { colors } from "../config/theme";
import { bg2 } from "../assets";
import CustomSpinner from "../components/CustomSpinner";

const ProtectedLayout: React.FC = () => {
  const location = useLocation();
  const { user, isPending } = useCurrentUser();
  const { data: profile, isPending: profilePending } = useMyProfile({
    enabled: !!user,
  });

  if (isPending || (!!user && profilePending)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundColor: colors.bg,
          backgroundImage: `url(${bg2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CustomSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isProfilePath = location.pathname === "/profile";
  const isProfileComplete = profile?.isComplete === true;

  if (!isProfileComplete && !isProfilePath) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
