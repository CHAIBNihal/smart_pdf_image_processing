import { ForbiddenException, Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from "argon2"
import { AuthDto, SignInDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { JwtService } from '@nestjs/jwt';
import { verifyToken } from './utils/verify-token';

@Injectable()
export class AuthService {
    constructor(private  prisma : PrismaService, private jwtService: JwtService){}


     async SignUp(dto: AuthDto)  {
     try {
       // generate Password hash
       const hash = await argon.hash(dto.password); 
      // Save new user in db 
      const createdUser = await this.prisma.user.create({
        data : {
          fullName: dto.fullName, 
          email: dto.email, 
          password: hash
        },
        select: {
          id: true,
          fullName: true,
          email: true, 
          Role : true, 
          isTokenExpired : true
        }
      })
      // return the save user 
      return createdUser;
     } catch (error) {
      if(error instanceof PrismaClientKnownRequestError){
        if(error.code === "P2002"){
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw error;
     }
       
     
    }

    async SignIn(dto : any){
      try {
        /**
         * Verify if : 
         * 1  - user email is exist : 
         *        -if user does not exist throw exception
         * 2 - Password is Similar  : 
         *      - if password incorrecte throw an incorrecte password exception 
         * Generate Token with a 24h as a expired duration 
         * setUser with token field in data base 
         * Return user with (fullName, token, email, Role)
         */
console.log(new Date().toISOString());

        const isUserExist = await this.prisma.user.findFirst({where : {email : dto.email}});
        if(!isUserExist) throw new ForbiddenException("this account is Undefined, please create an account")
         
        // If a password was provided (normal sign-in flow), verify it.
        if (dto.password !== undefined && dto.password !== null && dto.password !== "") {
          if (!isUserExist.password) {
            // No password stored for this user — cannot verify
            throw new UnauthorizedException();
          }

          const passwordMatches = await argon.verify(isUserExist.password, dto.password);
          if(!passwordMatches){
            console.log('Incorrcet password')
            throw new UnauthorizedException();
          }
        } 


          const token = await this.signToken(
            isUserExist.id,
            isUserExist.email,
            isUserExist.fullName,
            isUserExist.Role,
          );
      return {
      access_token :  token, 
        data : {
          email : isUserExist.email,
          username : isUserExist.fullName, 
          role : isUserExist.Role, 

        }
      }
      } catch (error) {
        if(error instanceof PrismaClientKnownRequestError){
        if(error.code === "P2002"){
          throw new ForbiddenException('Credentials taken')
        }
      }
      throw error;
      }
    }


    // SignToken fn 
    async signToken(userId : string, email : string, username : string, role : string) : Promise<string>{
      const payload = {
        sub : userId, email, username, role
      };

      return this.jwtService.signAsync(payload, {
        expiresIn: '1d'
      })
    }
    
    async verifyAcessToken(req: Request ){
      const authHeader = req.headers['authorization']
      if(!authHeader){
        throw new UnauthorizedException("Header Authorization is required!") 
      }
      const token = authHeader?.split(" ")[1]
      if (!token){
        throw new UnauthorizedException("Token is undefined !")
      }
     return await verifyToken(token, this.jwtService)
    }
    
    async signUpWithGoogle(dto : AuthDto){
        // generate Password hash
       const hash = await argon.hash(dto.password); 
       const createdUser = await this.prisma.user.create({
        data : {
          fullName: dto.fullName, 
          email: dto.email, 
          password: hash
        },
        select: {
          id: true,
          fullName: true,
          email: true, 
          Role : true, 
       
        }
      })

      return createdUser;
    }

}
