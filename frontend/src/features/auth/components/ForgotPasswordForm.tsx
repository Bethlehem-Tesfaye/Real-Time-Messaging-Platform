import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState<string>("");
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      {
        email,
        redirectTo: `${import.meta.env.VITE_CLIENT_URL}/reset-password`,
      },
      {
        onSuccess: () => {
          toast.success("Reset email sent successfully.");
          setEmail(""); // Optional: clear input on success
        },
        onError: (error: any) => {
          toast.error(error?.message || "Something went wrong.");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-2xl border border-[#4988C4] rounded-xl p-6 bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Forgot your password?</h2>
        <p className="text-sm text-gray-500">
          Enter your email and we’ll send you a password reset link.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#4988C4] outline-none"
            placeholder="you@roommatch.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!email || isPending}
          className="w-full bg-[#1C4D8D] hover:bg-[#0F2854] text-white rounded-md py-2 font-semibold transition-colors disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {isSuccess && (
        <p className="text-sm text-green-600 text-center mt-3 animate-in fade-in">
          Check your inbox! A reset link has been sent.
        </p>
      )}

      <Link
        to="/login"
        className="block text-center text-sm text-[#1C4D8D] font-medium mt-4 hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPasswordForm;
