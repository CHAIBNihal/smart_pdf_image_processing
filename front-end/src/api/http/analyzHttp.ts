import { createAxiosClient } from "./axiosFactory";

const analyzAxios = createAxiosClient(import.meta.env.VITE_API_ANALYZ);

export default {
  get: analyzAxios.get.bind(analyzAxios),
  post: analyzAxios.post.bind(analyzAxios),
  put: analyzAxios.put.bind(analyzAxios),
  delete: analyzAxios.delete.bind(analyzAxios),
  patch: analyzAxios.patch.bind(analyzAxios),
};
