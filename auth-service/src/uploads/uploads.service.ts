import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDto, UploadFileDto } from './Dtos';
import { SupabaseService } from 'src/supabase/supabase.service';


@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}
  // Get all Uploads
  async AllUploads(id: string) {
    try {
      if (!id)
        throw new BadRequestException(
          'ID du client requis',
        );
      const client =
        await this.prisma.user.findUnique({
          where: { id },
        });
      if (!client)
        throw new NotFoundException(
          `Client with this  Id : ${id} is not Found`,
        );
      const data =
        await this.prisma.uploads.findMany({
          where: {
            clientId: id,
          },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      return {
        uploads: data,
        count: data.length,
      };
    } catch (error) {
      throw error;
    }
  }
  // Step 1 : Create Upload meta data
  async CreateUpload(dto: UploadDto) {
    try {
      const client =
        await this.prisma.user.findUnique({
          where: {
            id: dto.clientId,
          },
        });
      if (!client)
        throw new NotFoundException(
          'Client Not found!!',
        );
      if (client.Role === 'ADMIN')
        throw new ForbiddenException(
          'Access Denied',
        );
      const created =
        await this.prisma.uploads.create({
          data: {
            clientId: client.id,
            motif: dto.motif,
          },
        });
      return {
        upload: created,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // Step 2 :  upload File
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier fourni',
      );
    }
    await this.validateFileType(file, dto.folder);
    // Générer un nom unique
    const fileExt = file.originalname
      .split('.')
      .pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${dto.folder}/${dto.clientId}/${fileName}`;

    // Upload vers Supabase Storage
    const { data, error } = await this.supabase
      .getClient()
      .storage.from(this.supabase.getBucketName())
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    console.log(error);
    if (error) {
      // More detailed error logging
      console.error(
        'Supabase storage error:',
        error,
      );
      throw new BadRequestException(
        `Erreur d'upload: ${error.message} - Code: ${error.cause}`,
      );
    }
    const { data: signedUrlWithToken } =
      await this.supabase
        .getClient()
        .storage.from(
          this.supabase.getBucketName(),
        )
        .createSignedUrl(
          filePath,
          60 * 60 * 24 * 7,
          {},
        );

   

    const isUploadExist =
      await this.prisma.uploads.findUnique({
        where: { id: dto.id },
      });
    if (!isUploadExist)
      throw new NotFoundException(
        'This Upload is undefined. Make sure that you created !!',
      );
    const fileUrl = signedUrlWithToken?.signedUrl;
   

    const UploadFile =
      await this.prisma.$transaction(
        async (tx) => {
          // 1️⃣ Créer le nouveau fichier
          console.log("creation=========",)
          const newFile =
            await tx.uploadfile.create({
              data: {
                upload_id: isUploadExist.id,
                file: fileUrl,
                isLast: true,
              },
            });
            console.log("Modification des autres uploadFile ============")

          // 2️⃣ Mettre tous les AUTRES à false
          await tx.uploadfile.updateMany({
            where: {
              upload_id: isUploadExist.id,
              NOT: {
                id: newFile.id,
              },
            },
            data: {
              isLast: false,
            },
          });

          return newFile;
        },
      );


    return {
      message: 'File Uploaded Successfuly',
      data: UploadFile,
    };
  }

  private validateFileType(
    file: Express.Multer.File,
    folder: string,
  ) {
    const allowedTypes = {
      images: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
      videos: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
      ],
      audios: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
      ],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    };

    if (
      !allowedTypes[folder].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        `Type de fichier non autorisé pour ${folder}. Types acceptés: ${allowedTypes[folder].join(', ')}`,
      );
    }

    // Limiter la taille (ex: 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Fichier trop volumineux (max 10MB)',
      );
    }
  }

  async getSingleUpload(id: string) {
    try {
      if (typeof id !== 'string') {
        throw new TypeError('Id must be string');
      }

      const upload =
        await this.prisma.uploads.findUnique({
          where: { id },
          include: {
            user: true,
            uploadfile: true,
          },
        });
      if (!upload) {
        return {
          message: `Upload with this is : ${id} Not found`,
          success: false,
        };
      }
      return {
        message: `Upload Successfuly Founded`,
        success: true,
        data: upload,
      };
    } catch (error) {
      throw error;
    }
  }

  async editeUpload(id: string, motif: string) {
    try {
      console.log('motif ====>', motif);
      if (typeof id !== 'string') {
        throw new TypeError('Id must be string');
      }

      // Normalize motif whether it's passed as a string or an object { motif: string }
      let motifVal: string;
      if (typeof motif === 'string') {
        motifVal = motif;
      } else if (
        motif &&
        typeof motif === 'object' &&
        typeof (motif as any).motif === 'string'
      ) {
        motifVal = (motif as any).motif;
      } else {
        console.log('Motif is', typeof motif);
        throw new TypeError(
          'Motif must be a string or an object with a string `motif` field',
        );
      }

      if (!motifVal || motifVal.trim() === '') {
        throw new BadRequestException(
          'Motif cannot be empty',
        );
      }

      const upload =
        await this.prisma.uploads.findUnique({
          where: { id },
        });
      if (!upload) {
        throw new NotFoundException(
          `Upload with this id: ${id} Not found`,
        );
      }
      const editedUpload =
        await this.prisma.uploads.update({
          where: { id },
          data: {
            motif: motifVal,
          },
          // include :{user : true}
        });

      return {
        data: editedUpload,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUpload(id: string) {
    try {
      const upload =
        await this.prisma.uploads.findUnique({
          where: { id },
        });
      if (!upload)
        throw new NotFoundException(
          'Upload not found',
        );

      const deletedUpload =
        await this.prisma.uploads.delete({
          where: { id },
        });
      return {
        message: 'Upload deleted successfully',
        data: deletedUpload,
        success: true,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        'Error in deleteUpload:',
        error,
      );
      throw new BadRequestException(
        'Failed to delete upload',
      );
    }
  }
}
