import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const apiClient = axios.create({
  baseURL: useAuthStore.getState().baseUrl,
});

// Outbound request hook engine
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Inbound response global monitor interceptor hook
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // 🛑 Avoid running automated logouts if the request was intentionally hitting the login route
    if (error.response && error.response.status === 401 && !originalRequest.url.includes("/auth/login")) {
      const auth = useAuthStore.getState();
      if (auth.isImpersonating && auth.stopImpersonation()) {
        window.location.href = "/superadmin/users";
      } else {
        auth.logout();
        window.location.href = "/"; // Redirects to login
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
