import type { IUserUploadsResponse } from "../../Interfaces/Upload";
import http from "../http/authHttp"

// const AUTH_ENDPOINT = "/auth";
const UPLOAD_ENDPOINT = "/uploads";

export const getUserUpload = () :Promise<IUserUploadsResponse> => {
    return http.get(`${UPLOAD_ENDPOINT}`);
}
