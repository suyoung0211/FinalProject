// src/api/authApi.js

import api from "./api";
import axios from "axios";

// 회원가입
export const signupApi = (body) => api.post("/auth/register", body);

// 로그인
export const loginApi = (body) => api.post("/auth/login", body);

// 내 정보 조회 — 반드시 단수 user/me
export const getMyInfoApi = () => api.get("/user/me");

// 로그아웃 — baseURL 자동 적용
export const logoutApi = (userId) => api.post(`/auth/logout/${userId}`);

// refreshToken 수동 갱신 - 앱 초기화에서 액세스 토큰 유효 확인
export const refreshTokenApi = () => axios.post("/auth/refresh", {}, { withCredentials: true });