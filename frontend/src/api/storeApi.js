import axios from "axios";  // 공개용
import api from "./api";    // 인증용(Authorization: Bearer 토큰 포함)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 🔹 공개용 → 카테고리 조회 / 비로그인 접근 가능한 API만 사용
const PublicAPI = axios.create({
  baseURL: `${API_URL}/api/store`, // 배포용 백엔드 URL 적용
  withCredentials: false, // 로그인 필요 없으므로 쿠키 사용 안 함
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

export async function uploadStoreImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/admin/store/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // 업로드된 이미지 URL
}