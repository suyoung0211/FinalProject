import api from "./api"; // 인증용 Axios 인스턴스 사용

// ============================
// 🔹 아이템 목록 조회 (공개)
// ============================
export function getItems(category, type) {
  // Access Token이 없으면 헤더 없음 → 공개 API처럼 동작
  return api.get(`/store/items`, { params: { category, type } });
}

// ============================
// 🔹 아이템 상세 조회 (공개)
// ============================
export function getItem(id) {
  return api.get(`/store/items/${id}`);
}

// ============================
// 🔹 아이템 구매 (로그인 필요)
// ============================
export function purchaseItem(itemId) {
  // Access Token이 없으면 서버에서 401 → 로그인 페이지 리다이렉트 처리 가능
  return api.post(`/store/purchase`, { itemId });
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