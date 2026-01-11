/*
  Warnings:

  - Added the required column `file` to the `Uploads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `uploads` ADD COLUMN `file` VARCHAR(191) NOT NULL;
