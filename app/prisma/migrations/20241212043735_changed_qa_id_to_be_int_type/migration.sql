/*
  Warnings:

  - The `qaId` column on the `IpfsPin` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "IpfsPin" DROP COLUMN "qaId",
ADD COLUMN     "qaId" INTEGER;
