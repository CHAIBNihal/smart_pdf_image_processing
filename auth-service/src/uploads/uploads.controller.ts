import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post,  UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import {type user } from '@prisma/client';
import { UploadDto, UploadFileDto } from './Dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from './Dtos/Pipes/FileValidationPipe.pipe';
import { type Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@Controller('uploads')
export class UploadsController {
  constructor(
    private uploadsService: UploadsService,
  ) {
    this.uploadsService = uploadsService;
  }
  // Step 1: Create Upload meta data
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "initialiser juste la table de upload en BD"})
  @Post('create')
  newUpload(@Body() uploadDto: UploadDto) {
    return this.uploadsService.CreateUpload(
      uploadDto,
    );
  }

  // Step 2 :  Upload file
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "exporter le fichier et l'affecter au upload créer en envoiyon le id de upload en etape suivant "})
  @Post('file')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example:
            'e87hkkjhb-GGK-4000in-78087ioghooi',
        },
        clientId: {
          type: 'string',
          example:
            'e87hkkjhb-GGK-4000in-78087ioghooi',
        },
        folder: {
          type: 'string',
          enum: [
            'images',
            'videos',
            'audios',
            'documents',
          ],
          example: 'images',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'file',
        'id',
        'clientId',
        'folder',
      ],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Body() uploadFileDto: UploadFileDto,
    @UploadedFile(new FileValidationPipe())
    file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadFile(
      file,
      uploadFileDto,
    );
  }

  // Get All Uploads
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "tous les exports de client"})
  @HttpCode(200)
  @Get('')
  allUploads(@GetUser() user: user) {
    return this.uploadsService.AllUploads(
      user.id,
    );
  }
  // Get Single Upload
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "recuperer un export par id"})
  @ApiParam({name : "id", example: 'e87hkkjhb-GGK-4000in-78087ioghooi'})
  @Get('upload/:id')
  upload(@Param('id') id: string) {
    return this.uploadsService.getSingleUpload(
      id,
    );
  }

  // Edite some fields on Our Upload
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "modifier un export par id"})
  @ApiBody({
    schema : {
      type : "object",
      properties : { 
        motif : {
          type : "string", 
          example : "cours nest js pdf"
        }
      },
      required : ['motif']
    },
    
  })
  @Patch('upload/edite/:id')
  editeUpload(
    @Param('id') id: string,
    @Body() body: { motif: string },
  ) {
    return this.uploadsService.editeUpload(
      id,
      body.motif,
    );
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "supprimer un export par id"})
  @Delete('delete/:id')
  deleteUpload(@Param('id') id: string) {
    return this.uploadsService.deleteUpload(id);
  }
}
