import axios from "axios";

// ------------------------------------------------------------
// ⭐ 기본 API 요청용 Axios 인스턴스
// ------------------------------------------------------------
// → 여기서는 Access Token을 자동으로 넣어줄 것

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // HttpOnly 쿠키(refreshToken) 자동 포함 🔥이거 꼭 있어야 쿠키가 실려감
});

// ------------------------------------------------------------
// ⭐ Refresh Token 전용 Axios 인스턴스
// ------------------------------------------------------------
// → 여기는 Authorization 헤더를 사용하지 않음 (중요!)
const refreshClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // refreshToken 쿠키 포함
});

// ------------------------------------------------------------
// ⭐ 요청 인터셉터
// ------------------------------------------------------------
// → 보호된 API 요청에만 Access Token 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token && !config.url.includes("/auth/refresh")) {
    // Refresh API 요청에 Authorization 헤더 붙으면 안됨!
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ------------------------------------------------------------
// ⭐ 응답 인터셉터
// ------------------------------------------------------------
// → Access Token 만료(401) 시 Refresh Token 자동 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 발생 & 아직 재시도 안했을 경우만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔥 Refresh 요청에서는 Authorization 헤더 제거
        delete refreshClient.defaults.headers.common["Authorization"];

        // Refresh Token은 Cookie(HttpOnly)로 자동 전송됨
        const refreshResponse = await refreshClient.post("/auth/refresh");

        const newAccessToken = refreshResponse.data.accessToken;

        // 새로운 Access Token 저장
        localStorage.setItem("accessToken", newAccessToken);

        // 실패했던 요청 Authorization 헤더 갱신
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 요청 다시 실행
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh Token 만료 또는 검증 실패 → 자동 로그아웃
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
