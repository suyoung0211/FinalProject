// src/api/api.js

import axios from "axios";

// ------------------------------------------------------------
// ⭐ Axios 인스턴스 생성
// ------------------------------------------------------------
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 🔹 HttpOnly 쿠키(Refresh Token) 자동 전송
});

// ------------------------------------------------------------
// ⭐ 요청 인터셉터
// ------------------------------------------------------------
// Access Token이 존재하면 모든 요청 헤더에 붙임
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------
// ⭐ 응답 인터셉터
// ------------------------------------------------------------
// Access Token 만료 시 Refresh Token으로 자동 재발급 후
// 실패했던 요청 다시 실행
api.interceptors.response.use(
  (response) => response, // 성공 응답 그대로 반환
  async (error) => {
    const originalRequest = error.config;

    // 🔹 401 Unauthorized 발생 + 재시도 안된 요청만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔹 Refresh Token은 HttpOnly 쿠키로 전송되므로 body 필요 없음
        const refreshResponse = await axios.post(
          "/auth/refresh",
          {}, // Body 없음
          { withCredentials: true } // 쿠키 포함
        );

        const newAccessToken = refreshResponse.data.accessToken;

        // 🔹 새 Access Token localStorage 저장
        localStorage.setItem("accessToken", newAccessToken);

        // 🔹 원래 요청 헤더 갱신
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 🔹 원래 실패했던 요청 재실행
        return api(originalRequest);
      } catch (refreshError) {
        // 🔹 Refresh Token 만료/실패 → 로그아웃 처리
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error); // 401 외 다른 오류는 그대로 전달
  }
);

export default api;