import type { IUser } from "./Auth";

export interface IUploads{
    id : string;
    motif : string;
    clientId : string;
    createdAt : string;
    updatedAt : string;
}

interface IUploadsUser{
    id : string;
    motif : string;
    clientId : string;
    createdAt : string;
    updatedAt : string;
    user : IUser
}

export interface IUserUploadsResponse{
    uploads : IUploadsUser[];
    count: number
}

