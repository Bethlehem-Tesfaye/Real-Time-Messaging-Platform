import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, Lock, User, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import type { RegistrationFormFields } from "../types/auth";
import { colors } from "../../../config/theme";

const RegistrationForm: React.FC = () => {
  const { register, isLoading } = useRegister();
  const signInWithGoogle = useGoogleAuth();
  const [form, setForm] = useState<RegistrationFormFields>({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register({
      ...form,
      callbackURL: `${window.location.origin}/verify-email`,
    });
  };

  return (
    <>
      <div className="mb-6 text-left">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: colors.secondary }}
        >
          Get started
        </p>
        <h2
          className="mt-1 text-2xl font-extrabold tracking-tight"
          style={{ color: colors.primary }}
        >
          Create your Blink account
        </h2>
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: colors.secondary }}
        >
          Set up your profile and start chatting in seconds.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="flex-1 cursor-pointer border rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
          style={{ borderColor: colors.secondary, color: colors.primary }}
        >
          <span
            className="h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold"
            style={{ borderColor: colors.secondary, color: colors.primary }}
          >
            G
          </span>
          Continue with Google
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div
          className="h-px flex-1"
          style={{ backgroundColor: `${colors.secondary}33` }}
        />
        <span className="text-xs" style={{ color: colors.secondary }}>
          OR CONTINUE WITH
        </span>
        <div
          className="h-px flex-1"
          style={{ backgroundColor: `${colors.secondary}33` }}
        />
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.secondary }}
            />
            <input
              id="name"
              type="text"
              className="h-10 w-full rounded-xl border pl-9 pr-3 text-sm"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: colors.bg,
                color: colors.primary,
              }}
              placeholder="Full name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.secondary }}
            />
            <input
              id="email"
              type="email"
              className="h-10 w-full rounded-xl border pl-9 pr-3 text-sm"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: colors.bg,
                color: colors.primary,
              }}
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.secondary }}
            />
            <input
              id="password"
              type="password"
              className="h-10 w-full rounded-xl border pl-9 pr-10 text-sm"
              style={{
                borderColor: `${colors.secondary}33`,
                backgroundColor: colors.bg,
                color: colors.primary,
              }}
              placeholder="Password"
              value={form.password}
              onChange={onChange}
              required
            />
            <EyeOff
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.secondary }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 h-10 w-full rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
          style={{ backgroundColor: colors.primary }}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p
        className="mt-6 text-center text-xs"
        style={{ color: colors.secondary }}
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold"
          style={{ color: colors.accent }}
        >
          Sign in
        </Link>
      </p>
    </>
  );
};

export default RegistrationForm;
