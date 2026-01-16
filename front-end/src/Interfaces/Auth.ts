export interface IUser {
    id: string, 
    Role : string, 
    email: string, 
    fullName: string,
    token : string, 
}
export interface ISignUpResponse{
    id: string, 
    Role : string, 
    email: string, 
    fullName: string,
}

export interface ISignInResponse{
    access_token : string,
    data : {
        email : string,
        username : string,
        role : string,
    }
}
