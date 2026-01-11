import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, MinLength } from "class-validator";

export class UploadDto{
    @ApiProperty({example:"cours nest js pdf "})
    @IsString()
    @IsNotEmpty({message : "The name is required"})
    @MinLength(3, {message : 'The name must contain more than 3 characters'})
    motif: string

    @ApiProperty({example: "e87hkkjhb-GGK-4000in-78087ioghooi"})
    @IsNotEmpty({message : "Client id is required"})
    clientId:string
}

export class UploadFileDto {
  @ApiProperty({example: "e87hkkjhb-GGK-4000in-78087ioghooi"})
  @IsString()
  @IsNotEmpty()
  id: string;
  
  @ApiProperty({example: "e87hkkjhb-GGK-4000in-78087ioghooi"})
  @IsString()
  @IsNotEmpty()
  clientId: string;
  @ApiProperty({description : "ici specifier le type de fichier au exporter",example :"images"})
  @IsIn([
    'images',
    'videos',
    'audios',
    'documents',
  ])
  @IsNotEmpty()
  folder:
    | 'images'
    | 'videos'
    | 'audios'
    | 'documents';
}