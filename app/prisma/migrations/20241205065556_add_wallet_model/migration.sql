-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userProfileId" TEXT,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userProfileId_key" ON "Wallet"("userProfileId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
