import type { AxiosInstance } from "axios";
import { AuthStore } from "../../Store/auth/AuthStore";


export const setupInterceptors = (axiosInstance: AxiosInstance)=>{

    // REQ Interc |  Add Authorization token to headers
    axiosInstance.interceptors.request.use(
        async (config) => {
            (config as any).metadata = { startTime: Date.now() };

            const skipAuth = !!(config as any).skipAuth;
            // Debug: indicate whether this request opted out of auth
            console.debug(`[API Request] ${config.url} skipAuth=${skipAuth} AuthorizationHeaderPresent=${!!config.headers?.Authorization}`);

            if (skipAuth) {
              // Ensure we don't accidentally send an Authorization header when skipAuth is set
              if (config.headers && (config.headers as any).Authorization) {
                delete (config.headers as any).Authorization;
              }
              return config;
            }

            try {
                let token : string | null =  null;

                if(!token){
                    token = AuthStore.getState().token || "";
                }

                // Si token est dispo ajouter le en Header de request 
                if(token && config.headers){
                    // Don't log token content for security; just note presence
                    console.debug(`[API Request] Adding Authorization header for ${config.url}`);
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    console.debug(`[API Request] No token available for ${config.url}`);
                }

                return config;
            } catch (error) {
                console.error(' ❌ Error In request Interceptor : ', error)
                return config;
            }
        }
    )

    // Res Interc | Log responses and track response time
    axiosInstance.interceptors.response.use(
        (response)=>{
            const startTimeReq = Date.now() - (response.config as any).metadata?.startTime;
            if(startTimeReq){
                if(import.meta.env.DEV){
                    console.log(`⏱️ API Response time : ${startTimeReq}ms`)
                }
            }
            console.log(` ✅ API :: ${response.config.url} [${response.status}]`)

            return response.data;

        }, 
         async (error) => {
      const responseStatus = error.response ? error.response.status : -1;
      const url = error.config?.url || "unknown";
      const backendError = error.response?.data;
      
      console.error(`❌ ${url} [${responseStatus}]`);
      
      // ALWAYS prioritize backend error data if it exists
      if (backendError && typeof backendError === 'object') {
        const backendMessage = backendError.message || backendError.error || backendError.msg || backendError.Message;
        
        // Auto-logout on 401 invalid token
        if (responseStatus === 401) {
          try {
            localStorage.removeItem("token");
            AuthStore.getState().logout();
          } catch (e) {
            console.error("Auto-logout after 401 failed:", e);
          }
        }

        // Return backend error
        return Promise.reject({
          message: backendMessage || `Error ${responseStatus}`,
          status: responseStatus,
          ...backendError,
        });
      }
      
      // No backend response data - use generic fallback messages
      switch (true) {
        case responseStatus === 401:
          try {
            localStorage.removeItem("token");
            const { logout } = AuthStore.getState();
            await logout();
          } catch (e) {
            console.error("Auto-logout after 401 failed:", e);
          }
          return Promise.reject({
            message: "Unauthorized. Please login again.",
            status: 401,
          });
          
        case responseStatus === 403:
          return Promise.reject({
            message: "You don't have permission to access this resource.",
            status: 403,
          });
          
        case responseStatus === 404:
          return Promise.reject({
            message: "Resource not found.",
            status: 404,
          });
          
        case responseStatus >= 500:
          return Promise.reject({
            message: "Server error. Please try again later.",
            status: responseStatus,
          });
          
        default:
          // Network error or no response
          if (!error.response && error.request) {
            return Promise.reject({
              message: "No internet connection. Please check your network and try again.",
              status: -1,
              isNetworkError: true,
            });
          }
          
          return Promise.reject({
            message: error.message || "Network error",
            status: responseStatus >= 0 ? responseStatus : -1,
            isNetworkError: !error.response,
          });
      }
    }
    )
}