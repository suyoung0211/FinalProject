import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

/**
 * =====================================================
 * 🔒 Refresh 동시성 제어
 * =====================================================
 */
let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (error: any) => void
) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshed(token: string) {
  console.log("✅ [AUTH] Refresh 성공 → AccessToken 갱신 완료");
  refreshSubscribers.forEach(sub => sub.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: any) {
  console.error("❌ [AUTH] Refresh 실패 → 로그아웃 처리", error);
  refreshSubscribers.forEach(sub => sub.reject(error));
  refreshSubscribers = [];
}

// ------------------------------------------------------------
// 요청 인터셉터
// ------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token && !config.url?.includes("/auth/refresh")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ------------------------------------------------------------
// 응답 인터셉터
// ------------------------------------------------------------
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // refresh 요청 자체가 실패한 경우
    if (originalRequest?.url?.includes("/auth/refresh")) {
      console.error("❌ [AUTH] Refresh API 자체가 401 반환");
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 refresh 중이면 대기
      if (isRefreshing) {
        console.log("⏳ [AUTH] Refresh 진행 중 → 요청 대기");
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              console.log("🔁 [AUTH] 대기 중이던 요청 재시도");
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            (err) => reject(err)
          );
        });
      }

      isRefreshing = true;
      console.log("🔄 [AUTH] AccessToken 만료 → Refresh 요청 시작");

      try {
        const refreshResponse = await refreshClient.post("/auth/refresh");
        const newAccessToken = refreshResponse.data.accessToken;

        console.log("🆕 [AUTH] 새 AccessToken 발급됨");

        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        onRefreshed(newAccessToken);
        return api(originalRequest);

      } catch (refreshError) {
        onRefreshFailed(refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
