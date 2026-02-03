/*
  Warnings:

  - You are about to drop the column `bookeddate` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `bookeddate` on the `student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `instructor` DROP COLUMN `bookeddate`,
    DROP COLUMN `imageUrl`,
    ADD COLUMN `car` VARCHAR(191) NULL,
    ADD COLUMN `carStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `student` DROP COLUMN `bookeddate`;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookedDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `studentId` INTEGER NOT NULL,
    `instructorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Admin_email_key` ON `Admin`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Instructor_email_key` ON `Instructor`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_email_key` ON `Student`(`email`);

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
