// axiosFactory.ts ==> Wrapp axios instance creation with interceptors setup
import axios from "axios";
import { setupInterceptors } from "./interceptor";

export const createAxiosClient = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  });

  setupInterceptors(instance);
  return instance;
};
