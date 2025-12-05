// src/api/voteApi.js (예시)
import api from "./api";

/* ============================================
 *  📌 1) 기본 조회 API
 * ============================================
 */

// 🔹 투표 상세 조회 (GET /api/votes/{voteId})
export const fetchVoteDetail = (voteId) =>
  api.get(`/votes/${voteId}`);

// 🔹 투표 목록 조회 (GET /api/votes/list)
export const fetchVoteList = () =>
  api.get(`/votes/list`);

// 🔹 배당률 조회 (GET /api/votes/{voteId}/odds)
export const fetchVoteOdds = (voteId) =>
  api.get(`/votes/${voteId}/odds`);


/* ============================================
 *  📌 2) 참여 관련 API
 * ============================================
 */

// 🔹 투표 참여 (POST /api/votes/{voteId}/participate)
//    서버 DTO: { choiceId, points }
export const participateVote = (voteId, choiceId, points) =>
  api.post(`/votes/${voteId}/participate`, {
    choiceId,
    points,
  });

// 🔹 내가 했던 특정 베팅 취소 (PATCH /api/votes/my/{voteUserId}/cancel)
export const cancelMyVote = (voteUserId) =>
  api.patch(`/votes/my/${voteUserId}/cancel`);

// 🔹 특정 투표 전체 취소 (본인이 그 투표에서 한 베팅 1건 취소)
//    PATCH /api/votes/{voteId}/cancel
export const cancelVote = (voteId) =>
  api.patch(`/votes/${voteId}/cancel`);


/* ============================================
 *  📌 3) 마이페이지 관련
 * ============================================
 */

// 🔹 내가 참여한 모든 투표 조회 (GET /api/votes/my)
export const fetchMyVotes = () =>
  api.get(`/votes/my`);

// 🔹 내 전체 투표 통계 조회 (GET /api/votes/my/statistics)
export const fetchVoteStatistics = () =>
  api.get(`/votes/my/statistics`);


/* ============================================
 *  📌 4) 관리자 / 운영 기능
 *    (현재는 별도 권한 체크 없이 엔드포인트만 존재)
 * ============================================
 */

// 🔹 투표 종료 (PATCH /api/votes/{voteId}/finish)
export const finishVote = (voteId) =>
  api.patch(`/votes/${voteId}/finish`);

// 🔹 정답 확정 (PATCH /api/votes/{voteId}/resolve/{choiceId})
export const resolveVote = (voteId, choiceId) =>
  api.patch(`/votes/${voteId}/resolve/${choiceId}`);

// 🔹 보상 지급 (PATCH /api/votes/{voteId}/reward)
export const rewardVote = (voteId) =>
  api.patch(`/votes/${voteId}/reward`);


/* ============================================
 *  📌 5) 투표 생성 API
 * ============================================
 */

// 🔹 AI가 자동 생성한 투표 저장 (POST /api/votes/ai-create)
export const createVoteByAI = (data) =>
  api.post(`/votes/ai-create`, data);

// 🔹 유저가 직접 투표 생성 (POST /api/votes/create)
export const createVoteByUser = (data) =>
  api.post(`/votes/create`, data);
