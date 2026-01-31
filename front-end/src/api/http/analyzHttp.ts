import { createAxiosClient } from "./axiosFactory";

const analyzAxios = createAxiosClient(import.meta.env.VITE_API_ANALYZ);

export default {
  get: analyzAxios.get.bind(analyzAxios),
  post: analyzAxios.post.bind(analyzAxios),
  put: analyzAxios.put.bind(analyzAxios),
  delete: analyzAxios.delete.bind(analyzAxios),
  patch: analyzAxios.patch.bind(analyzAxios),
};


/**
 * {
    "task_id": "47f99a01-c958-419a-9341-f1ff5cf0513d",
    "analyz_id": "a0488a1b-8560-4198-a5ae-cecafb64652e",
    "status": "processing",
    "message": "L'analyse du PDF est en cours"
}
 */