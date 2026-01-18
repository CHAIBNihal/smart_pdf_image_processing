import type { ICreateUploadResponse, IUploadFileReponse, IUserUploadsResponse } from "../../Interfaces/Upload";
import http from "../http/authHttp"

// const AUTH_ENDPOINT = "/auth";
const UPLOAD_ENDPOINT = "/uploads";

// Tous les téléchargements d'utilisateur
export const getUserUpload = () :Promise<IUserUploadsResponse> => {
    return http.get(`${UPLOAD_ENDPOINT}`);
}
// Initialiser la création
export const createUpload = (motif: string, clientId: string) : Promise<ICreateUploadResponse>=>{
    return http.post(`${UPLOAD_ENDPOINT}/create`, {motif, clientId});
}
// Télécharger plus qu'un Document pour un Upload id
export const uploadFiles = async (
  id: string, 
  clientId: string, 
  folder: string, 
  file: File
): Promise<IUploadFileReponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id', id);
  formData.append('clientId', clientId);
  formData.append('folder', folder);
  
  return http.post(`${UPLOAD_ENDPOINT}/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
// supprimer un upload 
export const deleteUpload = async(id : string) : Promise<any>=>{
    return http.delete(`${UPLOAD_ENDPOINT}/delete/${id}`)
}