/*
  Warnings:

  - You are about to drop the column `mobileNumber` on the `appointments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "mobileNumber",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "appointments_phoneNumber_key" ON "appointments"("phoneNumber");
