/*
  Warnings:

  - You are about to drop the column `country` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "country";

-- DropEnum
DROP TYPE "CountryCode";
