// src/api/adminApi.js

import api from "./api";

/**
 * 🔹 관리자 전체 유저 조회
 */
export const getAllAdminUsersApi = () => api.get("/admin/users");

/**
 * 🔹 특정 닉네임 검색
 * - Request Param: nickname
 */
export const searchAdminUsersApi = (nickname) =>
  api.get("/admin/users/search", { params: { nickname } });

/**
 * 🔹 특정 유저 조회
 * - PathVariable: userId
 */
export const getAdminUserByLoginIdApi = (userId) =>
  api.get(`/admin/users/${userId}`);

/**
 * 🔹 Admin 계정 추가
 */
export const createAdminApi = (body) =>
  api.post("/admin/create", body);

/**
 * 🔹 특정 유저 수정
 * - PathVariable: userId
 */
export const updateAdminUserApi = (userId, body) =>
  api.put(`/admin/users/${userId}`, body);

/**
 * 🔹 관리자 페이지 RSS 정보 가져오기
 * - RSS 목록 + 기사 수 등 포함
 */
export const getAllAdminRssFeeds = () =>
  api.get("/admin/rss-feeds");

/**
 * 🔹 관리자 페이지 RSS 정보 수정
 * - PathVariable: feedId
 * - Request Body: 수정 데이터
 */
export const updateAdminRssFeedApi = (feedId, body) => api.put(`/admin/rss-feeds/${feedId}`, body);

/**
 * 🔹 카테고리 목록 조회
 */
export const getCategories = () =>
  api.get("/admin/rss-feeds/categories");

// 🔥 관리자: 정답 선택만
export const adminResolveVote = (voteId, body) =>
  api.post(`/admin/votes/${voteId}/finish`, body);

// 🔥 관리자: 정답 선택 + 즉시 정산
export const adminResolveAndSettleVote = (voteId, body) =>
  api.post(`/admin/votes/${voteId}/resolve-and-settle`, body);

// 🔥 관리자: 이미 정답 선택된 투표 다시 정산
export const adminSettleVote = (voteId) =>
  api.post(`/admin/votes/${voteId}/settle`);
/**
 * 🔹 RSS Feed 생성 (관리자)
 */
export const createAdminRssFeed = (body) =>
  api.post("/admin/rss-feeds", body);

/**
 * 📍 단일 피드 수집 실행
 * - PathVariable: feedId
 * - POST /api/admin/rss-feeds/{feedId}/collect
 * - 반환: 저장된 기사 수 메시지
 */
export const collectSingleFeedApi = (feedId) =>
  api.post(`/admin/rss-feeds/${feedId}/collect`);

/**
 * 📍 특정 SourceName 활성화 피드 전체 수집
 * - PathVariable: sourceName
 * - POST /api/admin/rss-feeds/collect/{sourceName}
 * - sourceName과 일치하는 활성화 피드만 수집
 * - 반환: BatchResult JSON (fetched, saved, skipped)
 */
export const collectFeedsBySourceNameApi = (sourceName) =>
  api.post(`/admin/rss-feeds/collect/${sourceName}`);

/**
 * 📍 전체 피드 수집 실행
 * - POST /api/admin/rss-feeds/collect
 * - DB의 "active" 상태 피드만 대상
 */
export const collectAllFeedsApi = () =>
  api.post("/admin/rss-feeds/collect");

/**
 * 🔹 RSS 피드 삭제 (슈퍼 어드민 전용)
 * - PathVariable: feedId
 * - DELETE /api/admin/rss-feeds/{feedId}
 */
export const deleteFeedApi = (feedId) => api.delete(`/admin/rss-feeds/${feedId}`);

/**
 * 🔹 모든 이슈 조회 (관리자 / 슈퍼 어드민 전용)
 * - GET /api/issues
 * - 반환: IssueResponse 배열
 */
export const getAllIssuesApi = () => api.get('/issues');

/**
 * 🔹 이슈 상태 변경 (승인/거절)
 * - POST /api/issues/status
 * - 요청 바디: { issueId: number, status: "APPROVED" | "REJECTED" }
 */
export const updateAdminIssueStatusApi = (body) => api.post('/issues/status', body);
