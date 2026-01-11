import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { UnauthorizedException } from "@nestjs/common";

export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService : AuthService){
        super({
            usernameField :  "email"
        })
    }

    validate (email : string, password : string){
        console.log("This a validate localy startegy")
        if(password === "") throw new UnauthorizedException('Please provide a valid password ');
        return this.authService.SignIn({email, password})
    }
}