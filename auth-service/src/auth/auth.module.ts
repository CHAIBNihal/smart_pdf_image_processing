import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module' ;
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './config/jwt.config';
import googleAuthConfig from './config/google-auth.config';
import { GoogleStrategy, JwtStrategy, LocalStrategy } from './strategy';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports : [PrismaModule, 
    JwtModule.register({
      global : true, 
      secret : jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }), 
    ConfigModule.forFeature(googleAuthConfig)
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, LocalStrategy],
  controllers: [AuthController], 
  exports : [AuthService]
})
export class AuthModule {}
