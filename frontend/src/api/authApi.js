// src/api/authApi.js
import api from "./api";

// 회원가입
export const signupApi = (body) => api.post("/auth/register", body);

// 로그인
export const loginApi = (body) => api.post("/auth/login", body);

// 내 정보 조회
export const getMyInfoApi = () => api.get("/users/me");

// 로그아웃
export const logoutApi = () => api.post("/auth/logout");
