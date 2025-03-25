/*
  Warnings:

  - Added the required column `orderInsights` to the `Journey` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `route` on the `Journey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Journey" ADD COLUMN     "orderInsights" JSONB NOT NULL,
DROP COLUMN "route",
ADD COLUMN     "route" JSONB NOT NULL;
