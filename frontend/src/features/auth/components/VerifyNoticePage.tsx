import React from "react";
import { Link } from "react-router-dom";
import { useResendVerify } from "../hooks/useResendVerify";
import { useCurrentUser } from "../hooks/useCurrentUser";

const VerifyNoticePage: React.FC = () => {
  const { user } = useCurrentUser();
  const email: string | undefined = user?.email;
  const { mutate, isPending } = useResendVerify();

  const onResend = () => {
    if (!email) return;
    mutate({
      email,
      callbackURL: `${window.location.origin}/verify-email`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl border border-[#4988C4] rounded-xl p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Verify your email</h2>
          <p className="text-sm text-gray-500">
            We’ve sent a verification link to your email. Please check your
            inbox and click the link to continue.
          </p>
        </div>

        <div className="border border-[#BDE8F5] rounded-lg p-4 bg-[#BDE8F5]/30 text-sm text-gray-600">
          If you don’t see the email, check your spam folder or try resending.
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={!email || isPending}
            onClick={onResend}
            className="w-full bg-[#1C4D8D] hover:bg-[#0F2854] text-white rounded-md py-2 font-semibold transition-colors disabled:opacity-60"
          >
            {isPending ? "Sending..." : "Resend verification email"}
          </button>

          <Link
            to="/login"
            className="block text-center text-sm text-[#1C4D8D] font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyNoticePage;
