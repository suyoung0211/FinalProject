import api from "./api";

/* ============================================
 * AI Vote 댓글
 * ============================================ */


/**
 * 🔥 AI Vote 댓글 목록 조회
 * GET /api/comments?voteId=1
 */
export const fetchVoteComments = (voteId) => {
  return api.get("/api/comments", {
    params: { voteId },
  });
};

/**
 * 🔥 AI Vote 댓글 작성
 * POST /api/comments
 */
export const addVoteComment = (data) => {
  return api.post("/api/comments", {
    voteId: data.voteId,
    content: data.content,
    parentId: data.parentId ?? null,
  });
};

/**
 * 🔥 AI Vote 댓글 좋아요 / 싫어요
 * POST /api/comments/{id}/react?like=true|false
 */
export const reactVoteComment = (commentId, like) => {
  return api.post(
    `/api/comments/${commentId}/react`,
    null,
    {
      params: { like },
    }
  );
};

/**
 * 🔥 AI Vote 댓글 수정
 * PUT /api/comments/{id}
 */
export const updateVoteComment = (commentId, content) => {
  return api.put(`/api/comments/${commentId}`, {
    content,
  });
};

/**
 * 🔥 AI Vote 댓글 삭제 (Soft Delete)
 * DELETE /api/comments/{id}
 */
export const deleteVoteComment = (commentId) => {
  return api.delete(`/api/comments/${commentId}`);
};



  