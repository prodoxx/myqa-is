/*
  Warnings:

  - Added the required column `type` to the `ExternalLink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialLink" AS ENUM ('FACEBOOK', 'TWITTER', 'INSTAGRAM', 'YOUTUBE', 'THREADS', 'SNAPCHAT');

-- AlterTable
ALTER TABLE "ExternalLink" ADD COLUMN     "type" "SocialLink" NOT NULL;
