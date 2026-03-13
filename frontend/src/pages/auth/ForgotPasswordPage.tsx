import React from "react";
import ForgotPasswordForm from "../../features/auth/components/ForgotPasswordForm";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;
