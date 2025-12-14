import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // refreshToken(HttpOnly 쿠키) 포함
});

const refreshClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

/**
 * =====================================================
 * 🔒 Refresh 동시성 제어 (JS 버전)
 * =====================================================
 */
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * refresh 중인 요청들을 큐에 저장
 */
function subscribeTokenRefresh(resolve, reject) {
  refreshSubscribers.push({ resolve, reject });
}

/**
 * refresh 성공 시 대기 중이던 요청들 재개
 */
function onRefreshed(token) {
  console.log("✅ [AUTH] Refresh 성공 → AccessToken 갱신 완료");

  refreshSubscribers.forEach(sub => {
    sub.resolve(token);
  });

  refreshSubscribers = [];
}

/**
 * refresh 실패 시 대기 중이던 요청들 전부 실패 처리
 */
function onRefreshFailed(error) {
  console.error("❌ [AUTH] Refresh 실패 → 로그아웃 처리", error);

  refreshSubscribers.forEach(sub => {
    sub.reject(error);
  });

  refreshSubscribers = [];
}

// ------------------------------------------------------------
// 요청 인터셉터
// ------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // refresh 요청에는 Authorization 헤더 붙이지 않음
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

    // refresh API 자체에서 401이면 그대로 실패
    if (originalRequest?.url?.includes("/auth/refresh")) {
      console.error("❌ [AUTH] Refresh API 자체가 401 반환");
      return Promise.reject(error);
    }

    // AccessToken 만료 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 이미 refresh 중이면 대기
      if (isRefreshing) {
        console.log("⏳ [AUTH] Refresh 진행 중 → 요청 대기");

        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token) => {
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

        // 새 AccessToken 저장
        localStorage.setItem("accessToken", newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        onRefreshed(newAccessToken);

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        onRefreshFailed(refreshError);

        // 진짜 로그아웃 처리
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
