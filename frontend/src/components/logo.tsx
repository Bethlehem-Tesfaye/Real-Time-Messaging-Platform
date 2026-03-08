import React from "react";
import { colors } from "../config/theme";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className="grid h-10 w-10 place-items-center rounded-xl"
        style={{
          background: `linear-gradient(145deg, ${colors.accent}, ${colors.primary})`,
          boxShadow: `0 8px 18px ${colors.primary}33`,
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5.5 w-5.5">
          <path
            d="M5.25 7.5a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25v5.25A2.25 2.25 0 0 1 16.5 15h-4.188l-2.933 2.346A.75.75 0 0 1 8.25 16.75V15H7.5a2.25 2.25 0 0 1-2.25-2.25V7.5Z"
            fill={colors.bg}
          />
          <circle cx="9" cy="10" r="1" fill={colors.accent} />
          <circle cx="12" cy="10" r="1" fill={colors.accent} />
          <circle cx="15" cy="10" r="1" fill={colors.accent} />
        </svg>
      </div>

      <div className="leading-tight">
        <span
          className="block text-[1.05rem] font-extrabold tracking-tight"
          style={{ color: colors.primary }}
        >
          Blink
        </span>
        <span
          className="block text-[0.62rem] font-medium uppercase tracking-[0.18em]"
          style={{ color: colors.secondary }}
        >
          Real-time chat
        </span>
      </div>
    </div>
  );
};

export default Logo;
