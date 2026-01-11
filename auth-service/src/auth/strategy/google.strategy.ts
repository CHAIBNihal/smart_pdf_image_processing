import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback, Profile } from "passport-google-oauth20";
import googleAuthConfig from "../config/google-auth.config";
import { type ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(googleAuthConfig.KEY) 
        private googleConfiguration: ConfigType<typeof googleAuthConfig>, 
        private authService : AuthService
    ) {
        super({
            clientID: googleConfiguration.clientID,
            clientSecret: googleConfiguration.clientSecret,
            callbackURL: googleConfiguration.callbackURL,
            scope: ["email", "profile"]
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ): Promise<any> {
      //  console.log("Profile from google strategy===>",{ profile });
      //console.log("Json auth with google", {_json})

      
      const user =
        await this.authService.signUpWithGoogle({
          fullName: profile.displayName,
          email: profile._json.email || '',
          password: '',
        });

      done(null, user);
    }
}