import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

type FolderType = 'images' | 'videos' | 'audios' | 'documents';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly folderMimeTypes: Record<FolderType, string[]> = {
    images: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    videos: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ],
    audios: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
    ],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
    ],
  };

  private readonly folderMaxSizes: Record<FolderType, number> = {
    images: 5 * 1024 * 1024,
    videos: 100 * 1024 * 1024,
    audios: 10 * 1024 * 1024,
    documents: 10 * 1024 * 1024,
  };

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Le fichier est requis');
    }

    const folder = this.detectFolder(file.mimetype);

    if (!folder) {
      throw new BadRequestException(
        `Type de fichier non supporté: ${file.mimetype}`,
      );
    }

    const maxSize = this.folderMaxSizes[folder];
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `Fichier trop volumineux pour ${folder} (max ${maxSizeMB}MB)`,
      );
    }

    (file as any).detectedFolder = folder;
    return file;
  }

  private detectFolder(mimeType: string): FolderType | null {
    return (Object.keys(this.folderMimeTypes) as FolderType[]).find(
      (folder) => this.folderMimeTypes[folder].includes(mimeType),
    ) ?? null;
  }
}
