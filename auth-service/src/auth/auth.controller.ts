import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {  AuthDto, SignInDto } from './dto';
import { GoogleAuthGuard } from 'src/auth/guard';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags("Authentication")
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
    this.authService = authService;
  }

  @ApiOperation({summary : "Api pour Enregistrement d'utilisateur"})
  @Post('signup')
  SignUp(@Body() dto : AuthDto) {
    return this.authService.SignUp(dto);
  }
  @ApiOperation({summary : "Api pour la connexion d'utilisateur"})
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  SignIn(@Body() dto : SignInDto){
  
    return this.authService.SignIn(dto)
  }
  
  @ApiBearerAuth('access-token')
  @ApiOperation({summary : "Api pour valider le token pour la securiter des autres routes explicite le token "})
  @Get('verify')
  async  verifyToken(@Request() req: Request) {
    return this.authService.verifyAcessToken(req)
  }

  
  @ApiOperation({summary : "Créez un compte utilisateur avec Google"})
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
   googleLogin(){
  }

  @ApiOperation({summary : "Google login callback url"})
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async Googlecallback(@Req() req, @Res() res){
    const response = await this.authService.SignIn(req.user)
    res.redirect(`http://localhost:3000?token=${response.access_token}`)
  }
}
