// publicProfile.js
import api from "./api";

/**
 * 🔹 공개 프로필 조회
 * - userId 기준
 * - 프로필 카드 / hover 카드 / 게시글 작성자 클릭 시 사용
 */
export const getPublicUserProfileApi = (userId) => {
  // 방어 코드: userId 없으면 요청 자체를 막음
  if (!userId) {
    throw new Error("getPublicUserProfileApi: userId가 필요합니다.");
  }

  return api.get(`/users/${userId}/profile`);
};