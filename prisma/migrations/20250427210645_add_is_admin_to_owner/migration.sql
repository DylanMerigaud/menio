/*
  Warnings:

  - You are about to drop the column `isPrimary` on the `restaurant_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "restaurant_images" DROP COLUMN "isPrimary";
