import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/store",
});

// 요청마다 토큰 자동 첨부
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================
// 아이템 목록 조회
// =============================
export function getItems(category, type) {
  return API.get("/items", {
    params: { category, type },
  });
}

// =============================
// 아이템 상세 조회
// =============================
export function getItem(id) {
  return API.get(`/items/${id}`);
}

// =============================
// 아이템 구매
// =============================
export function purchaseItem(itemId) {
  return API.post("/purchase", { itemId });
}

// =============================
// 내가 구매한 아이템 목록
// =============================
export function getMyItems() {
  return API.get("/my-items");
}