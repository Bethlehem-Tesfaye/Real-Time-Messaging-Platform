import { betterAuth, logger } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { openAPI } from "better-auth/plugins";
import { publishEmailJob } from "../../jobs/qstash";
import { env } from "../../config/environments";
import { prisma } from "../../lib/prisma";

const authBaseURL = (
  env.BETTER_AUTH_BASE_URL || "http://localhost:4000/api/auth"
).replace(/\/$/, "");

const googleClientId = env.GOOGLE_CLIENT_ID_BAUTH || env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  env.GOOGLE_CLIENT_SECRET_BAUTH || env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [
    env.CLIENT_URL ?? process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:4000"
  ].filter(Boolean) as string[],
  baseURL: authBaseURL,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      const html = `
        <p>Hi ${user.name ?? user.email},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
        <p>If you did not request a password reset, you can ignore this email.</p>
      `;

      await publishEmailJob({
        type: "reset",
        to: user.email,
        subject: "Reset your password",
        html,
        token
      });
    }
  },

  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const html = `
        <p>Hello ${user.name ?? user.email},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#1a73e8;color:#fff;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
      `;

      await publishEmailJob({
        type: "verification",
        to: user.email,
        subject: "Verify your email",
        html
      });
    },
    autoSignInAfterVerification: true,
    async afterEmailVerification(user) {
      logger.info(`${user.email} successfully verified!`);
    }
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: googleClientId!,
      clientSecret: googleClientSecret!
    }
  },

  plugins: [openAPI()],

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const newUser = ctx.context.newSession?.user;
        if (newUser) {
          const profileCreator = (prisma as unknown as Record<string, unknown>)
            .profile as
            | {
                create?: (args: {
                  data: { userId: string };
                }) => Promise<unknown>;
              }
            | undefined;
          await profileCreator
            ?.create?.({ data: { userId: newUser.id } })
            .catch(() => {});
        }
      }
    })
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    defaultCookieAttributes: {
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    }
  },

  cookie: {
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    path: "/"
  }
});
