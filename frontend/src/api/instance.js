// JWT 자동 첨부 + 리프레시 토큰 처리
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false,
});

// 요청 인터셉터 — accessToken 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터 — 토큰 만료 시 refresh 요청
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // accessToken 만료 → refreshToken 존재?
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("리프레시 토큰 없음. 로그인 필요");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8080/api/auth/refresh", {
          refreshToken: refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (e) {
        console.log("리프레시 토큰도 만료됨");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
