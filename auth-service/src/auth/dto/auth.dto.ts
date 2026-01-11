import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto{
    @ApiProperty({example:"John Doe"})
    @IsString()
    @IsNotEmpty()
    fullName : string;

    @ApiProperty({example:"johnDoe@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email : string;

    @ApiProperty({example:"12345678"})
    @IsString()
    @IsNotEmpty()
    password : string;
}

export class SignInDto{
    @ApiProperty({example:"johnDoe@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email : string;

    @ApiProperty({example:"12345678"})
    @IsString()
    @IsNotEmpty()
    password : string;
}