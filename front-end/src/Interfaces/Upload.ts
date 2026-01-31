import type { IUser } from "./Auth";

export interface IUploads{
    id : string;
    motif : string;
    clientId : string;
    createdAt : string;
    updatedAt : string;
}
export interface IUpload{
    id : string;
    motif : string;
    createdAt : string;
    updatedAt : string;
    uploadfile : IUploadFile[]
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



//===================Interface of Uploads apis respinse =========================
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
export interface ISingleUploadResponse{
    message : string; 
    success : boolean; 
    data : IUpload
}