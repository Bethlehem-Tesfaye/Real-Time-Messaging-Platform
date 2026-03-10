/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "username" VARCHAR(30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profile_username_key" ON "profile"("username");
