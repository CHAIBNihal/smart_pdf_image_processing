-- CreateTable
CREATE TABLE `uploadFile` (
    `id` VARCHAR(191) NOT NULL,
    `upload_id` VARCHAR(191) NOT NULL,
    `file` VARCHAR(500) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uploadFile` ADD CONSTRAINT `uploadFile_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `Uploads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
