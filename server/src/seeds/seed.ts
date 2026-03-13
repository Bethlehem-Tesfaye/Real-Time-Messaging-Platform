import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { logger } from "../config/logger";

const prisma = new PrismaClient();

async function main() {
  logger.info("Seeding database...");

  /* ============================================================
     1. Seed Users
  ============================================================ */

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const users = [
    {
      id: randomUUID(),
      name: "Admin User",
      email: "admin@example.com",
      emailVerified: true
    },
    {
      id: randomUUID(),
      name: "Test User",
      email: "test@example.com",
      emailVerified: true
    },
    {
      id: randomUUID(),
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: false
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credentials",
            accountId: user.email,
            password: passwordHash
          }
        }
      }
    });
  }

  logger.info("Users seeded successfully");

  /* ============================================================
     2. Fetch Seeded Users
  ============================================================ */

  const seededUsers = await prisma.user.findMany();

  /* ============================================================
     3. Seed Categories + Expenses (2 each per user)
  ============================================================ */

  for (const user of seededUsers) {
    logger.info(`Seeding categories + expenses for ${user.email}`);

    /* -------------------------------
       Categories (2 dummy)
    -------------------------------- */

    const foodCategory = await prisma.category.upsert({
      where: {
        name_userId: {
          name: "Food",
          userId: user.id
        }
      },
      update: {},
      create: {
        name: "Food",
        userId: user.id
      }
    });

    const transportCategory = await prisma.category.upsert({
      where: {
        name_userId: {
          name: "Transport",
          userId: user.id
        }
      },
      update: {},
      create: {
        name: "Transport",
        userId: user.id
      }
    });

    /* -------------------------------
       Expenses (2 dummy)
    -------------------------------- */

    await prisma.expense.createMany({
      data: [
        {
          amount: 250,
          merchant: "Pizza Hut",
          date: new Date(),
          userId: user.id,
          categoryId: foodCategory.id
        },
        {
          amount: 80,
          merchant: "Uber Ride",
          date: new Date(),
          userId: user.id,
          categoryId: transportCategory.id
        }
      ]
    });
  }

  logger.info("Categories + Expenses seeded successfully");
  logger.info("Seed completed!");
}

main()
  .catch((e) => {
    logger.error("Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
