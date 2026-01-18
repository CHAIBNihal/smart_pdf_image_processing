import type { IUser } from "./Auth";

export interface IUploads{
    id : string;
    motif : string;
    clientId : string;
    createdAt : string;
    updatedAt : string;
}
export interface IUploadFile{
    id :string;
    upload_id :string;
    file : string;
    isLast : boolean
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
export interface ICreateUploadResponse{
    upload : IUploads;
    success : boolean;
}

export interface IUploadFileReponse{
    message :string;
    data : IUploadFile
}
