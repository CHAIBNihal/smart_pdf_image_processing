import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Forcer nest a utiliser le ValidationPipe Globaly Dés  qui est utiliser  
  app.useGlobalPipes(new ValidationPipe({whitelist : true, transform : true}))
  app.enableCors({
    origin : ['http://localhost:3000'], 
    credentials : true
  })
   const config = new DocumentBuilder()
    .setTitle('Auth && Uploads service docs')
    .setDescription('The auth & uploads API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type : "http", 
        scheme : "Bearer",
        bearerFormat : "JWT",
        description : "Saisir le jwt token"
      }, 
      "access-token",
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
