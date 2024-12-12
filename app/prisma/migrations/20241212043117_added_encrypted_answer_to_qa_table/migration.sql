/*
  Warnings:

  - The primary key for the `QA` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currentKeys` on the `QA` table. All the data in the column will be lost.
  - The `id` column on the `QA` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `unlockPriceInBonk` on the `QA` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Added the required column `encryptedAnswer` to the `QA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QA" DROP CONSTRAINT "QA_userProfileId_fkey";

-- DropIndex
DROP INDEX "QA_onChainId_key";

-- AlterTable
ALTER TABLE "QA" DROP CONSTRAINT "QA_pkey",
DROP COLUMN "currentKeys",
ADD COLUMN     "encryptedAnswer" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "unlockPriceInBonk" SET DATA TYPE INTEGER,
ADD CONSTRAINT "QA_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "QA_ipfsPinId_idx" ON "QA"("ipfsPinId");

-- CreateIndex
CREATE INDEX "QA_userProfileId_idx" ON "QA"("userProfileId");

-- CreateIndex
CREATE INDEX "QA_userId_idx" ON "QA"("userId");

-- AddForeignKey
ALTER TABLE "QA" ADD CONSTRAINT "QA_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
