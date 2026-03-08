import React from "react";
import { useSearchParams } from "react-router-dom";
import ResetPasswordForm from "../../features/auth/components/ResetPasswordForm";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token: string | null = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      {token ? <ResetPasswordForm token={token} /> : null}
    </div>
  );
};

export default ResetPasswordPage;
