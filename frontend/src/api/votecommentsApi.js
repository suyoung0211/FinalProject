import api from "./api";

/* ============================================
 * AI Vote 댓글
 * ============================================ */

export const fetchVoteComments = (voteId) =>
  api.get(`/comments`, { params: { voteId } });

export const addVoteComment = (body) =>
  api.post(`/comments`, body);

export const reactVoteComment = (commentId, like) =>
  api.post(`/comments/${commentId}/react`, null, {
    params: { like },
  });

export const deleteVoteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);

// 🔹 댓글 수정  ⭐ 수정된 부분
export const updateVoteComment = (commentId, content) =>
  api.put(`/comments/${commentId}`, { content });



  