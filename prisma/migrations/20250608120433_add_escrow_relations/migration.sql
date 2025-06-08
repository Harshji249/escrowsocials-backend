-- DropForeignKey
ALTER TABLE "Escrow" DROP CONSTRAINT "Escrow_buyerId_fkey";

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "buyerEmail" TEXT,
ALTER COLUMN "buyerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
