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
export const refreshTokenApi = () => api.post("/auth/refresh", {}, {
                                                transformRequest: [(data, headers) => {
                                                delete headers.Authorization; // 액세스 토큰 제거
                                                return data;
                                                }]});

//  1 `/api/auth/refresh` 요청 생성 (`api` 인스턴스 사용)
//  2 `transformRequest`에서 Authorization 제거
//  3 브라우저가 쿠키(리프레시 토큰) 자동 전송
//  4 서버가 쿠키만 확인 → 새 액세스 토큰 발급
//  5 프론트엔드가 새 액세스 토큰 저장 → 이후 요청에 자동 적용
