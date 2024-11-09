/*
  Warnings:

  - You are about to drop the column `usersId` on the `orders` table. All the data in the column will be lost.
  - Added the required column `userId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "usersId",
ADD COLUMN     "userId" TEXT NOT NULL;
