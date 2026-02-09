/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instructor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_studentId_fkey`;

-- DropIndex
DROP INDEX `Booking_instructorId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Booking_studentId_fkey` ON `booking`;

-- DropTable
DROP TABLE `admin`;

-- DropTable
DROP TABLE `instructor`;

-- DropTable
DROP TABLE `student`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'STUDENT', 'INSTRUCTOR') NOT NULL DEFAULT 'STUDENT',
    `car` VARCHAR(191) NULL,
    `carStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
