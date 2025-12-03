import api from "./api";

// 🔥 전체 카테고리 가져오기
export const fetchCategories = () => api.get("/categories");

// 🔥 카테고리별 기사 가져오기
export const fetchArticlesByCategory = (category) =>
  api.get(`/categories/${category}/articles`);
