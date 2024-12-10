/*
  Warnings:

  - You are about to drop the column `lockedAnswerId` on the `QA` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `QA` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[onChainId]` on the table `QA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ipfsPinId]` on the table `QA` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currentKeys` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipfsPinId` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxKeys` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `onChainId` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symmetricKey` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unlockPrice` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QA` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `QA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IpfsPin" DROP CONSTRAINT "IpfsPin_qaId_fkey";

-- AlterTable
ALTER TABLE "QA" DROP COLUMN "lockedAnswerId",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentKeys" INTEGER NOT NULL,
ADD COLUMN     "ipfsPinId" TEXT NOT NULL,
ADD COLUMN     "maxKeys" INTEGER NOT NULL,
ADD COLUMN     "onChainId" TEXT NOT NULL,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "symmetricKey" TEXT NOT NULL,
ADD COLUMN     "unlockPrice" BIGINT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QA_onChainId_key" ON "QA"("onChainId");

-- CreateIndex
CREATE UNIQUE INDEX "QA_ipfsPinId_key" ON "QA"("ipfsPinId");

-- AddForeignKey
ALTER TABLE "QA" ADD CONSTRAINT "QA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QA" ADD CONSTRAINT "QA_ipfsPinId_fkey" FOREIGN KEY ("ipfsPinId") REFERENCES "IpfsPin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
