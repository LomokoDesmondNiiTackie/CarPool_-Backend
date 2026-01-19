/*
  Warnings:

  - A unique constraint covering the columns `[rawToken]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "rawToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_rawToken_key" ON "Booking"("rawToken");
