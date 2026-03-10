import React from "react";
import { Navigate } from "react-router-dom";
import { bg2 } from "../../assets";
import CustomSpinner from "../../components/CustomSpinner";
import { colors } from "../../config/theme";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { useMyProfile } from "../../features/profile/hooks/useMyProfile";
import Landing from "../../features/landing/components/Landing";

const LandingPage: React.FC = () => {
  const { user, isPending: sessionPending } = useCurrentUser();
  const { data: profile, isPending: profilePending } = useMyProfile({
    enabled: !!user,
  });

  if (sessionPending || (!!user && profilePending)) {
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
    return <Landing />;
  }

  if (profile?.isComplete) {
    return <Navigate to="/chat" replace />;
  }

  return <Navigate to="/profile" replace />;
};

export default LandingPage;
