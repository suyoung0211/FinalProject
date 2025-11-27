import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/home",
});

// 전체 홈 데이터 (top3 투표 + hot issue + ai banner)
export const fetchHomeData = () => api.get("");

// 카테고리별 이슈 가져오기
export const fetchArticlesByCategory = (category) =>
  api.get(`/articles/category/${category}`);
