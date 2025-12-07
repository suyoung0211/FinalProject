import axios from "axios";  // 공개용
import api from "./api";    // 인증용(Authorization: Bearer 토큰 포함)

// 🔹 공개용 → 카테고리 조회 / 비로그인 접근 가능한 API만 사용
const PublicAPI = axios.create({
  baseURL: "/api/store",
});

// ============================
// 🔹 아이템 목록 조회 (공개)
// ============================
export function getItems(category, type) {
  return PublicAPI.get("/items", { params: { category, type } });
}

// ============================
// 🔹 아이템 상세 조회 (공개)
// ============================
export function getItem(id) {
  return PublicAPI.get(`/items/${id}`);
}

// ============================
// 🔹 아이템 구매 (로그인 필요)
// ============================
export function purchaseItem(itemId) {
  return api.post("/store/purchase", { itemId });
}

// ============================
// 🔹 내가 구매한 아이템 목록 (로그인 필요)
// ============================
export function getMyItems() {
  return api.get("/store/my-items");
}
