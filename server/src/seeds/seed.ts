// import { PrismaClient } from "@prisma/client";
// import { randomUUID } from "crypto";
// import bcrypt from "bcryptjs";
// import { logger } from "../config/logger";

// const prisma = new PrismaClient();

// // async function main() {
// //   logger.info("Seeding database...");

// //   /* ============================================================
// //      1. Seed Users
// //   ============================================================ */

// //   const passwordHash = await bcrypt.hash("Password123!", 10);

// //   const users = [
// //     {
// //       id: randomUUID(),
// //       name: "Admin User",
// //       email: "admin@example.com",
// //       emailVerified: true
// //     },
// //     {
// //       id: randomUUID(),
// //       name: "Test User",
// //       email: "test@example.com",
// //       emailVerified: true
// //     },
// //     {
// //       id: randomUUID(),
// //       name: "Demo User",
// //       email: "demo@example.com",
// //       emailVerified: false
// //     }
// //   ];

// //   for (const user of users) {
// //     await prisma.user.upsert({
// //       where: { email: user.email },
// //       update: {},
// //       create: {
// //         ...user,
// //         accounts: {
// //           create: {
// //             id: randomUUID(),
// //             providerId: "credentials",
// //             accountId: user.email,
// //             password: passwordHash
// //           }
// //         }
// //       }
// //     });
// //   }

// //   logger.info("Users seeded successfully");
// // }
