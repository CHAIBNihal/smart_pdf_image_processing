import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

export interface TokenPayload {
    sub: string, 
    email: string, 
    username : string, 
    role : string, 
    iat?:number,
    exp?:number
}
export const verifyToken = async (
    token: string,
  jwtService: JwtService,
): Promise<TokenPayload>=>{
    if(!token){
        throw new UnauthorizedException("Token is Missing");
    }
    try {
        return await jwtService.verifyAsync<TokenPayload>(token)
    } catch (error) {
        throw new UnauthorizedException('Token is Invalid or Expired')
    }
}