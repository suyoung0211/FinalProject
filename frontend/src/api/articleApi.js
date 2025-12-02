import api from "./api";

/** 
 * 뉴스 기사 목록 조회 
 * category === '홈'이면 전체 조회
 */
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
