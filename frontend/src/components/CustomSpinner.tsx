import React from "react";
import { colors } from "../config/theme";
import Logo from "./logo";

const CustomSpinner: React.FC = () => {
  return (
    <div
      className="rounded-3xl  p-6"
      style={{
        borderColor: `${colors.secondary}33`,
        // backgroundColor: "#FFFFFFCC",
        backdropFilter: "blur(4px)",
      }}
    >
      <div className="relative grid h-20 w-20 place-items-center">
        {/* <span
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: `${colors.secondary}40` }}
        /> */}
        <span
          className="absolute inset-0 animate-spin rounded-full border-4"
          style={{
            borderColor: colors.primary,
            borderTopColor: "transparent",
          }}
        />
        <Logo iconOnly className="relative z-10" />
      </div>
    </div>
  );
};

export default CustomSpinner;
