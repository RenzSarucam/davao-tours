-- AlterTable
ALTER TABLE `booking` ADD COLUMN `remainingBalance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `reservationFee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `reservationFeeMethod` VARCHAR(191) NULL,
    ADD COLUMN `reservationFeePaid` BOOLEAN NOT NULL DEFAULT false;
