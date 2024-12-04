/*
  Warnings:

  - You are about to drop the column `userId` on the `ExternalLink` table. All the data in the column will be lost.
  - Added the required column `userProfileId` to the `ExternalLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExternalLink" DROP CONSTRAINT "ExternalLink_userId_fkey";

-- AlterTable
ALTER TABLE "ExternalLink" DROP COLUMN "userId",
ADD COLUMN     "userProfileId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ExternalLink" ADD CONSTRAINT "ExternalLink_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
