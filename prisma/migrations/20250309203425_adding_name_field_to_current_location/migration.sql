/*
  Warnings:

  - Added the required column `name` to the `CurrentLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CurrentLocation" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "productId" SET DEFAULT 1;
