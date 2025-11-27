import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,   // ★ 쿠키 기반 refresh 사용하는 경우 필요
});

// ★ JWT 붙이기
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✔ 투표 전체 목록 불러오기
export const fetchVoteList = async () => {
  const res = await API.get("/votes/list"); // 백엔드에서 제공 필요
  return res.data;
};

// ✔ 투표 상세
export const fetchVoteDetail = async (voteId) => {
  const res = await API.get(`/votes/${voteId}`);
  return res.data;
};

// ✔ 투표 요청 (옵션 선택 + 포인트 배팅)
export const submitVote = async (voteId, optionId, points) => {
  const res = await API.post(`/votes/${voteId}/submit`, {
    optionId,
    points,
  });
  return res.data;
};