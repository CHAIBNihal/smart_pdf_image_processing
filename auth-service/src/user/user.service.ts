import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class UserService{
    constructor(private prisma: PrismaService){}

    async changeSit(id: string, situation: boolean){
        try {
            if(!id) {
                throw new BadRequestException("id of user is required")
            }
            const isUserExist = await this.prisma.user.findUnique({where : {id}});
            if (!isUserExist){
                throw new NotFoundException("User with this id is not exist!");
            }
            const updatedUserSituation = await this.prisma.user.update({
                where : {id : isUserExist.id}, 
                data : {
                  situation
                }
            })

            if (!updatedUserSituation){
               return {
                error : "Votre situation n'est pas régler. Essayer avec un autre mode de paiement!",
                success: false, 
                data: null
               }
            }
            return {
                success : true, 
                message: "Votre Situation est changée !", 
                data : updatedUserSituation
            }
        } catch (error) {
            throw error;
        }
    }
}