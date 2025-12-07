import api from "./api";

/* ================================
   📌 기사 리스트
================================ */
export const fetchArticleListAll = async () => {
  const res = await api.get("/articles?page=0&size=100");
  return res.data.content;
};

export const fetchArticleList = async (category) => {
  const categoryParam = category === "홈" ? "" : category;

  const res = await api.get("/articles", {
    params: { category: categoryParam, page: 0, size: 50 },
  });

  return res.data.content;
};

/* ================================
   📌 기사 상세
================================ */
export const fetchArticleDetail = async (articleId) => {
  const res = await api.get(`/articles/${articleId}`);
  return res.data;
};

/* ================================
   📌 조회수 증가
================================ */
export const increaseArticleView = async (articleId) => {
  return api.post(`/articles/${articleId}/view`);
};

/* ================================
   📌 반응 (좋아요 · 싫어요 · 취소)
================================ */
export const likeArticle = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/like`);
  return res.data;
};

export const dislikeArticle = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/dislike`);
  return res.data;
};

export const resetArticleReaction = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/reaction/reset`);
  return res.data;
};

/* ================================
   📌 댓글
================================ */
export const fetchArticleComments = async (articleId) => {
  const res = await api.get(`/articles/${articleId}/comments`);
  return res.data;
};

export const postArticleComment = async (articleId, data) => {
  const res = await api.post(`/articles/${articleId}/comments`, data);
  return res.data;
};

export const updateArticleComment = async (commentId, data) => {
  const res = await api.put(`/articles/comments/${commentId}`, data);
  return res.data;
};

export const deleteArticleComment = async (commentId) => {
  const res = await api.delete(`/articles/comments/${commentId}`);
  return res.data;
};
// 댓글 반응 (LIKE / DISLIKE / RESET)
export const reactComment = async (commentId, reaction) => {
  const res = await api.post(`/articles/comments/${commentId}/reactions`, {
    reaction,
  });
  return res.data;
};

export const reactArticle = async (articleId, reaction) => {
  const res = await api.post(`/articles/${articleId}/reaction`, {
    reaction
  });
  return res.data;
};
