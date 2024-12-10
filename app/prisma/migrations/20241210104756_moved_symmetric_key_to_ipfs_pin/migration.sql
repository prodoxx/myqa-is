/*
  Warnings:

  - You are about to drop the column `symmetricKey` on the `QA` table. All the data in the column will be lost.
  - Added the required column `symmetricKey` to the `IpfsPin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpfsPin" ADD COLUMN     "symmetricKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QA" DROP COLUMN "symmetricKey",
ALTER COLUMN "currentKeys" SET DEFAULT 0;
