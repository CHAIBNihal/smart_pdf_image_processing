import type { ISignInResponse, ISignUpResponse } from "../../Interfaces/Auth";
import http from "../http/authHttp";

const AUTH_ENDPOINT = "/auth";

export const signUp = (fullName: string, email: string, password: string): Promise<ISignUpResponse> => {
  return http.post(`${AUTH_ENDPOINT}/signup`, { fullName, email, password }, {skipAuth: true} as any);
}

export const login = (email: string, password: string): Promise<ISignInResponse> => {
  return http.post(`${AUTH_ENDPOINT}/signin`, { email, password }, 
    { skipAuth: true } as any
  );
}
export const verifyToken = () : Promise<any> => {
    // cette api prend le token depuis le header Authorization
    return http.get(`${AUTH_ENDPOINT}/verify`);
}


export const loginWithGoogle = (): void => {
    // Redirect to the backend OAuth endpoint, which will handle the redirect to Google
    window.location.href = `${import.meta.env.VITE_API_AUTH}${AUTH_ENDPOINT}/google/login`;
}