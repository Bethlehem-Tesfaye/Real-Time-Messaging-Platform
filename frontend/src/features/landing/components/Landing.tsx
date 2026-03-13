import React from "react";
import { hero } from "../../../assets";
import { colors } from "../../../config/theme";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  return (
    <section
      style={{ backgroundColor: colors.bg }}
      className="relative overflow-hidden w-full min-h-screen py-20"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-20 -left-20 rounded-full bubble-float-a"
          style={{
            width: 240,
            height: 240,
            backgroundColor: `${colors.accent}CC`,
          }}
        />
        <div
          className="absolute -top-14 -right-14 rounded-full bubble-float-b"
          style={{
            width: 180,
            height: 180,
            backgroundColor: `${colors.secondary}AA`,
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 rounded-full bubble-float-c"
          style={{
            width: 240,
            height: 240,
            backgroundColor: `${colors.primary}B3`,
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 rounded-full bubble-float-d"
          style={{
            width: 280,
            height: 280,
            backgroundColor: `${colors.accent}B3`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 flex flex-col md:flex-row items-center gap-10 ">
        <div className="md:w-1/2  ml-30">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: colors.secondary }}
          >
            Real-time communication
          </p>
          <h1
            className="mt-2 text-4xl leading-tight md:text-5xl font-extrabold tracking-tight"
            style={{ color: colors.primary }}
          >
            Chat faster with Blink
          </h1>

          <p
            className="mt-4 max-w-xl text-base leading-relaxed md:text-lg"
            style={{ color: colors.secondary }}
          >
            Blink is a real-time messaging platform for rooms, instant
            conversations, and live presence updates so your team always stays
            in sync.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link to="login">
              <button
                style={
                  {
                    "--btn-bg": colors.accent,
                    "--btn-bg-hover": colors.primary,
                    "--btn-text": "#fff",
                  } as React.CSSProperties
                }
                className="btn btn-themed-fill px-8 py-6 rounded-full shadow"
              >
                Get Started
              </button>
            </Link>

            <button
              style={
                {
                  "--btn-border": colors.primary,
                  "--btn-color": colors.primary,
                  "--btn-hover-text": colors.bg,
                } as React.CSSProperties
              }
              className="btn btn-themed-outline px-8 py-6 rounded-full"
            >
              Read More
            </button>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 440,
                height: 440,
                background: "rgba(113,90,90,0.08)",
              }}
            >
              <img
                src={hero as string}
                alt="Chattrix phone preview"
                className="w-80 h-auto rounded-2xl shadow-2xl object-cover"
              />
            </div>

            <div
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: colors.notify,
                boxShadow: `0 0 0 4px ${colors.notify}22`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
