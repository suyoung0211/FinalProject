import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 공개 API → 인증 필요 없음
const PublicAPI = axios.create({
  baseURL: API_URL, // 절대로 뒤에 /api 붙이면 안된다!
  withCredentials: false,
});

export async function resolveImageApi(path) {
  if (!path) return "";

  const encoded = encodeURIComponent(path);

  // 여기에서 /api/resolve-image만 붙인다 (앞에 /api 하나만)
  const res = await PublicAPI.get(`/api/resolve-image?path=${encoded}`);
  return res.data;
}