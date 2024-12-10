-- CreateEnum
CREATE TYPE "PinStatus" AS ENUM ('PINNED', 'UNPINNED');

-- CreateTable
CREATE TABLE "IpfsPin" (
    "id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "status" "PinStatus" NOT NULL DEFAULT E'PINNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "qaId" TEXT,

    CONSTRAINT "IpfsPin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpfsPin_cid_key" ON "IpfsPin"("cid");

-- CreateIndex
CREATE INDEX "IpfsPin_userId_idx" ON "IpfsPin"("userId");

-- CreateIndex
CREATE INDEX "IpfsPin_cid_idx" ON "IpfsPin"("cid");

-- AddForeignKey
ALTER TABLE "IpfsPin" ADD CONSTRAINT "IpfsPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IpfsPin" ADD CONSTRAINT "IpfsPin_qaId_fkey" FOREIGN KEY ("qaId") REFERENCES "QA"("id") ON DELETE SET NULL ON UPDATE CASCADE;
