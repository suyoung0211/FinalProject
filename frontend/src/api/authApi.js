// src/api/authApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// 회원가입 API
export const signupApi = (body) => API.post("/auth/signup", body);

// 로그인 API
export const loginApi = (body) => API.post("/auth/login", body);

// 내 정보 조회
export const getMyInfoApi = (token) =>
  API.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

// 로그아웃 API (refresh-token 블랙리스트)
export const logoutApi = (token) =>
  API.post(
    "/auth/logout",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
