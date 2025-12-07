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

// 관리자 페이지 rss 정보 수정
export const updateAdminRssFeedApi = (feedId, body) => api.put(`/admin/rss-feeds/${feedId}`, body);

// GET: 카테고리 목록 조회
export const getCategories = () => api.get("/admin/rss-feeds/categories");

// POST: 피드 생성
export const createAdminRssFeed = (body) => api.post("/admin/rss-feeds", body);

// 🔥 관리자: 정답 선택만
export const adminResolveVote = (voteId, body) =>
  api.post(`/admin/votes/${voteId}/resolve`, body);

// 🔥 관리자: 정답 선택 + 즉시 정산
export const adminResolveAndSettleVote = (voteId, body) =>
  api.post(`/admin/votes/${voteId}/resolve-and-settle`, body);

// 🔥 관리자: 이미 정답 선택된 투표 다시 정산
export const adminSettleVote = (voteId) =>
  api.post(`/admin/votes/${voteId}/settle`);
