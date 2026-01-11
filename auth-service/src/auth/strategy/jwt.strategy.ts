
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../config/jwt.config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private prisma : PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // this fn return a payload from jwt same case in express when we pass the req.user with  authMiddleware 
  async validate(payload: {
    sub : string, email : string, username : string, role : string
  }) {
   
    const user = await this.prisma.user.findUnique({
      where : {id : payload.sub}, 
      select : {
      id : true,
      email:true, 
      fullName: true,
      Role: true
      }
    })
     console.log("TypeOf =======>",  user)
    return user;
  }
}
