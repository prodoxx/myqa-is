/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[publicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_userProfileId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "publicKey" VARCHAR(255);

-- DropTable
DROP TABLE "Question";

-- CreateTable
CREATE TABLE "QA" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lockedAnswerId" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,

    CONSTRAINT "QA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicKey_key" ON "User"("publicKey");

-- AddForeignKey
ALTER TABLE "QA" ADD CONSTRAINT "QA_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
