import api from "./api";

/** ============================
 *  뉴스 기사 리스트 조회
 * ============================ */

// 전체 기사 로드
export const fetchArticleListAll = async () => {
  const res = await api.get("/articles?page=0&size=100");
  return res.data.content; // Page 객체의 content만 반환
};

// 카테고리별 기사 조회
export const fetchArticleList = async (category) => {
  const categoryParam = category === "홈" ? "" : category;

  const res = await api.get("/articles", {
    params: {
      category: categoryParam,
      page: 0,
      size: 50,
    },
  });

  return res.data.content;
};


/** ============================
 *  뉴스 상세 조회
 * ============================ */
export const fetchArticleDetail = async (articleId) => {
  const res = await api.get(`/articles/${articleId}`);
  return res.data;
};


/** ============================
 *  조회수 증가
 * ============================ */
export const increaseArticleView = async (articleId) => {
  return api.post(`/articles/${articleId}/view`);
};


/** ============================
 *  좋아요 토글
 * ============================ */
export const toggleArticleLike = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/like`);
  return res.data; // { liked: true/false }
};


/** ============================
 *  북마크 토글
 * ============================ */
export const toggleArticleBookmark = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/bookmark`);
  return res.data; // { bookmarked: true/false }
};


/** ============================
 *  댓글 목록 조회
 * ============================ */
export const fetchArticleComments = async (articleId) => {
  const res = await api.get(`/articles/${articleId}/comments`);
  return res.data; // List<CommentResponse>
};


/** ============================
 *  댓글 작성
 * ============================ */
export const postArticleComment = async (articleId, data) => {
  const res = await api.post(`/articles/${articleId}/comments`, data);
  return res.data; // 서버에서 작성된 댓글 객체 반환
};


/** ============================
 *  관련 뉴스 조회
 * ============================ */
export const fetchRelatedArticles = async (articleId) => {
  const res = await api.get(`/articles/${articleId}/related`);
  return res.data; // List<ArticleSimpleResponse>
};

/** ============================
 *  싫어요 토글
 * ============================ */
export const toggleArticleDislike = async (articleId) => {
  const res = await api.post(`/articles/${articleId}/dislike`);
  return res.data; // { disliked: true/false }
};

