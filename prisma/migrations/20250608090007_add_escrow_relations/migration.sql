/*
  Warnings:

  - The `status` column on the `Escrow` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `comissionType` to the `Escrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "comissionType" TEXT NOT NULL,
ADD COLUMN     "onboarding" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0;
