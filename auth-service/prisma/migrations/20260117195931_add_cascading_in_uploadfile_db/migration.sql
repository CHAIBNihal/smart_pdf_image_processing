-- DropForeignKey
ALTER TABLE `uploadfile` DROP FOREIGN KEY `uploadFile_upload_id_fkey`;

-- AddForeignKey
ALTER TABLE `uploadfile` ADD CONSTRAINT `uploadFile_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
