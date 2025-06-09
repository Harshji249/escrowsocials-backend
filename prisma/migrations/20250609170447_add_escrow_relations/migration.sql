-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileUrl" TEXT;

-- CreateTable
CREATE TABLE "BankInfo" (
    "id" SERIAL NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "BankInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankInfo_userId_key" ON "BankInfo"("userId");

-- AddForeignKey
ALTER TABLE "BankInfo" ADD CONSTRAINT "BankInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
