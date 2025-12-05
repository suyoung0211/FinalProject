// src/api/adminApi.js
import api from "./api";

// 관리자 전체 유저 조회
export const getAllAdminUsersApi = () => api.get("/admin/users");

// 특정 nickname 검색
export const searchAdminUsersApi = (nickname) => api.get("/admin/users/search", { params: { nickname } });

// 특정 유저 조회
export const getAdminUserByLoginIdApi = (userId) => api.get(`/admin/users/${userId}`);

// Admin 계정 추가
export const createAdminApi = (body) => api.post("/admin/create", body);

// 특정 유저 수정
export const updateAdminUserApi = (userId, body) => api.put(`/admin/users/${userId}`, body);

// 관리자 페이지 rss 정보 가져오기
export const getAllAdminRssFeeds = () => api.get("/admin/rss-feeds");