/*
  Warnings:

  - You are about to drop the column `unlockPrice` on the `QA` table. All the data in the column will be lost.
  - Added the required column `unlockPriceInBonk` to the `QA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QA" DROP COLUMN "unlockPrice",
ADD COLUMN     "unlockPriceInBonk" BIGINT NOT NULL;
