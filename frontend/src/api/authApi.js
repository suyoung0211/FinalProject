import api from "./api";

// 회원가입
export const signupApi = (body) => api.post("/auth/register", body);

// 로그인
export const loginApi = (body) => api.post("/auth/login", body);

// 내 정보 조회 — 반드시 단수 user/me
export const getMyInfoApi = () => api.get("/user/me");

// 로그아웃 — baseURL 자동 적용
export const logoutApi = (userId) => api.post(`/auth/logout/${userId}`);