// src/api/normalVoteApi.js
import api from "./api";

/* ============================================
 *  1) 기본 CRUD API
 * ============================================
 */

// 🔹 투표 생성 (POST /api/normal-votes/normal_create)
export const createNormalVote = (data) =>
  api.post(`/normal-votes/normal_create`, data);

// 🔹 투표 목록 조회 (GET /api/normal-votes/list)
export const fetchNormalVoteList = () =>
  api.get(`/normal-votes/list`);

// 🔹 투표 상세 조회 (GET /api/normal-votes/{id})
export const fetchNormalVoteDetail = (voteId) =>
  api.get(`/normal-votes/${voteId}`);

// 🔹 투표 전체 수정 (PUT /api/normal-votes/{id})
export const updateNormalVote = (voteId, data) =>
  api.put(`/normal-votes/${voteId}`, data);

// 🔹 투표 삭제 (DELETE /api/normal-votes/{id})
export const deleteNormalVote = (voteId) =>
  api.delete(`/normal-votes/${voteId}`);
