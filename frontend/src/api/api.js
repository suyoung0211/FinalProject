import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // 🔹 HttpOnly 쿠키(Refresh Token) 자동 전송
});

// 요청 인터셉터 → Access Token만 헤더에 붙임
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터 → Access Token 만료 시 자동 재요청
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔹 Refresh Token은 HttpOnly 쿠키로 전송되므로 body 필요 없음
        const refreshResponse = await axios.post(
          "/auth/refresh",
          {}, // Body 없음
          { withCredentials: true } // 쿠키 포함
        );

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 실패했던 요청 재실행
        return api(originalRequest);
      } catch (e) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
