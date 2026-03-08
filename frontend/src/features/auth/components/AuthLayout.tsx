import { bg2 } from "../../../assets";
import Logo from "../../../components/logo";
import type { AuthLayoutProps } from "../types/auth";

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#EAF3FA]">
      <img
        src={bg2 as string}
        alt="Sky background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-white/35" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="px-6 pt-6 md:px-10">
          <div className="inline-flex items-center gap-2 px-1 py-1">
            <Logo />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/72 p-5 shadow-xl backdrop-blur-md md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
