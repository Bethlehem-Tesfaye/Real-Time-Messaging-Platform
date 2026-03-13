import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../features/auth/hooks/useCurrentUser";
import { useVerifyEmail } from "../../features/auth/hooks/useVerify";
import { api } from "../../lib/axios";
import type { ProfileApiResponse } from "../../features/profile/types/profile";
import CustomSpinner from "../../components/CustomSpinner";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token: string | null = searchParams.get("token");

  const navigate = useNavigate();

  const { isPending: verifyPending } = useVerifyEmail(token ?? undefined);
  const { user, isPending: sessionPending } = useCurrentUser();

  useEffect(() => {
    if (sessionPending || !user) {
      return;
    }

    void (async () => {
      try {
        const profileRes = await api.get<ProfileApiResponse>("/api/profile/me");
        navigate(profileRes.data.data.isComplete ? "/chat" : "/profile");
      } catch {
        navigate("/profile");
      }
    })();
  }, [sessionPending, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg text-center">
        {verifyPending || sessionPending ? (
          <div className="flex justify-center">
            <CustomSpinner />
          </div>
        ) : token ? (
          <div className="flex justify-center">
            <CustomSpinner />
          </div>
        ) : (
          <p className="text-sm text-gray-600">No verification token found.</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
