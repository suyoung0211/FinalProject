import axios from "axios";  // 🔹 공개용 Axios (토큰 없음)
import api from "./api";    // 🔹 비공개용 -> 로그인 했을 때(토큰 있음)

// 🔹 공개용 Axios (토큰 없음)
const API = axios.create({
  baseURL: "/api/store",
});

// 🔹 비공개용 -> 로그인 했을 때(토큰 있음)
//    api -> 이걸로 맵핑

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