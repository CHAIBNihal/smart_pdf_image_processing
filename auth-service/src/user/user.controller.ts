import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type user } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@ApiTags("Utilisateurs")
@UseGuards(JwtGuard) // This line is a middleware it check if user has a token or his token is valid 
@Controller('users')
export class UserController{
    constructor(private userService: UserService){
        this.userService=userService
    }
    @ApiBearerAuth('access-token')
    @ApiOperation({summary : "Obtenir mon Profile"})
    @Get("me")
    getMe(@GetUser() user: user){
        //console.log("User from req ",user )
        return user; 
    }
    @ApiBearerAuth('access-token')
    @ApiOperation({summary : "Modifier les donner de mon profile "})
    @Get('edite')
    editeProfile(@GetUser() user : user ,@GetUser("fullName") fullName : string){
        // console.log("id from params ", user)
        return user;
    }

    @ApiBearerAuth('access-token')
    @ApiOperation({summary: "Changer la situation de user apres la resultat de paiement"})
    @Patch("change-situation")
    changeSituation(@Param("id") id : string, @Body() situation: boolean ){
        return this.userService.changeSit(id, situation);
    }
}
