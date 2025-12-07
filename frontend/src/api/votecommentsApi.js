// src/api/emailApi.js
import api from "./api";

// 🔹 댓글 조회 (AI Vote)
export const fetchVoteComments = (voteId) =>
  api.get(`/comments`, { params: { voteId } });

// 🔹 댓글 조회 (Normal Vote)
export const fetchNormalVoteComments = (normalVoteId) =>
  api.get(`/comments`, { params: { normalVoteId } });

export const addVoteComment = (body) =>
  api.post(`/comments`, body);

export const reactVoteComment = (commentId, like) =>
  api.post(`/comments/${commentId}/react`, null, {
    params: { like },
  });

  export const deleteVoteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);

  