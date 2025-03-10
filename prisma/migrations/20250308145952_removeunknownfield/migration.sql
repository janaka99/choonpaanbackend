/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Product` table. All the data in the column will be lost.
  - Made the column `userId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_createdBy_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "createdBy",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
