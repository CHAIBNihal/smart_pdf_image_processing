import { IsBoolean, IsNotEmpty, IsString } from "class-validator";



export class UserDto{
@IsString()
@IsNotEmpty()
id :string

@IsBoolean()
situation : boolean
}