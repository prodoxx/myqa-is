/*
  Warnings:

  - A unique constraint covering the columns `[walletPublicKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_walletPublicKey_key" ON "User"("walletPublicKey");
