-- AlterTable
ALTER TABLE `booking` ADD COLUMN `assignedDriverId` INTEGER NULL,
    ADD COLUMN `licenseHolderName` VARCHAR(191) NULL,
    ADD COLUMN `licenseImageUrl` VARCHAR(191) NULL,
    ADD COLUMN `needsDriver` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_assignedDriverId_fkey` FOREIGN KEY (`assignedDriverId`) REFERENCES `Driver`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
