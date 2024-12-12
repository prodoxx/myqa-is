-- CreateEnum
CREATE TYPE "PinType" AS ENUM ('QUESTION', 'ANSWER');

-- AlterTable
ALTER TABLE "IpfsPin" ADD COLUMN     "type" "PinType" NOT NULL DEFAULT 'QUESTION';
