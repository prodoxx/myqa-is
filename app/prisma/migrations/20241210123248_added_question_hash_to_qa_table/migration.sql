/*
  Warnings:

  - Added the required column `questionHash` to the `QA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QA" ADD COLUMN     "questionHash" TEXT NOT NULL;
