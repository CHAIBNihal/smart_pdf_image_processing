import { createAxiosClient } from "./axiosFactory";

const AUTH_API_URL = import.meta.env.VITE_API_AUTH;

const authAxios = createAxiosClient(AUTH_API_URL);

export default {
  get: authAxios.get.bind(authAxios),
  post: authAxios.post.bind(authAxios),
  put: authAxios.put.bind(authAxios),
  delete: authAxios.delete.bind(authAxios),
  patch: authAxios.patch.bind(authAxios),
};
