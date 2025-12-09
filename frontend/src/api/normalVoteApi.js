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

// 🔹 일반투표 참여
export const participateNormalVote = (voteId, choiceId) =>
  api.post(`/normal-votes/${voteId}/participate`, {
    choiceId,
    points: 0
  });

export const finishNormalVote = (voteId) =>
  api.patch(`/normal-votes/${voteId}/finish`);

export const cancelNormalVote = (voteId) =>
  api.patch(`/normal-votes/${voteId}/cancel`);

export const fetchMyNormalVotes = () =>
  api.get(`/normal-votes/my`);

export const fetchNormalVoteResult = (voteId) =>
  api.get(`/normal-votes/${voteId}/result`);

/* ============================================
 * Normal Vote 댓글
 * ============================================ */

export const fetchNormalVoteComments = (normalVoteId) =>
  api.get(`/normal-votes/comments`, { params: { normalVoteId } });

export const addNormalVoteComment = (body) =>
  api.post(`/normal-votes/comments`, body);
// body = { normalVoteId, content, parentId }

export const reactNormalVoteComment = (commentId, like) =>
  api.post(`/normal-votes/comments/${commentId}/react`, null, {
    params: { like },
  });

export const deleteNormalVoteComment = (commentId) =>
  api.delete(`/normal-votes/comments/${commentId}`);

// 🔹 댓글 수정  ⭐ 수정된 부분
export const updateNormalVoteComment = (commentId, content) =>
  api.put(`/normal-votes/comments/${commentId}`, { content });
