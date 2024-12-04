/*
  Warnings:

  - The values [MYFAQ] on the enum `SocialLink` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('BASIC_INFORMATION', 'SOCIAL_LINKS', 'CRYPTO_WALLET', 'DONE');

-- AlterEnum
BEGIN;
CREATE TYPE "SocialLink_new" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'YOUTUBE', 'THREADS', 'SNAPCHAT');
ALTER TABLE "ExternalLink" ALTER COLUMN "type" TYPE "SocialLink_new" USING ("type"::text::"SocialLink_new");
ALTER TYPE "SocialLink" RENAME TO "SocialLink_old";
ALTER TYPE "SocialLink_new" RENAME TO "SocialLink";
DROP TYPE "SocialLink_old";
COMMIT;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "onboarding" "OnboardingStep" NOT NULL DEFAULT E'BASIC_INFORMATION';
