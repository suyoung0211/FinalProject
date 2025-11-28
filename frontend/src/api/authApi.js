import api from "./api";

// 회원가입
export const signupApi = (body) => api.post("/auth/register", body);

// 로그인
export const loginApi = (body) => api.post("/auth/login", body);

// 내 정보 조회 — 반드시 단수 user/me
export const getMyInfoApi = () => api.get("/user/me");

// 로그아웃 — baseURL 자동 적용
export const logoutApi = (userId) => api.post(`/auth/logout/${userId}`);

// 관리자 전체 유저 조회
export const getAllAdminUsersApi = () => api.get("/admin/users");

// 특정 loginId 검색
export const searchAdminUsersApi = (loginId) => api.get("/admin/users/search", { params: { loginId } });

// 특정 유저 조회
export const getAdminUserByLoginIdApi = (loginId) => api.get(`/admin/users/${loginId}`);

// Admin 계정 추가
export const createAdminApi = (body) => api.post("/admin/create", body);