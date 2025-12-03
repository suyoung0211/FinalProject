import api from "./api";

/** ------------------------------
 *  기본 조회 API
 * ------------------------------ */

// 🔹 투표 상세 조회
export const fetchVoteDetail = (voteId) =>
  api.get(`/votes/${voteId}`);

// 🔹 투표 목록 조회 (VoteListPage 용)
export const fetchVoteList = () =>
  api.get(`/votes/list`);

// 🔹 배당(odds) 조회
export const fetchVoteOdds = (voteId) =>
  api.get(`/votes/${voteId}/odds`);


/** ------------------------------
 *  참여 관련 API
 * ------------------------------ */

// 🔹 투표 참여
export const participateVote = (voteId, choiceId, amount) =>
  api.post(`/votes/${voteId}/participate`, {
    choiceId,
    amount,        // ⚠️ 백엔드 DTO 이름 반드시 확인 필요 (amount / points)
  });

// 🔹 내가 이 투표에서 한 선택 조회
export const fetchMyVote = (voteId) =>
  api.get(`/votes/${voteId}/my`);

// 🔹 내가 했던 베팅 취소
export const cancelMyVote = (voteUserId) =>
  api.patch(`/votes/my/${voteUserId}/cancel`);


/** ------------------------------
 *  마이페이지 관련
 * ------------------------------ */

// 🔹 내가 참여한 모든 투표 조회
export const fetchMyVotes = () =>
  api.get(`/votes/my`);

// 🔹 내 전체 투표 통계 조회
export const fetchVoteStatistics = () =>
  api.get(`/votes/my/statistics`);


/** ------------------------------
 *  관리자 기능
 * ------------------------------ */

// 🔹 투표 종료
export const finishVote = (voteId) =>
  api.post(`/votes/${voteId}/admin/finish`);

// 🔹 정답 확정
export const resolveVote = (voteId, choiceId) =>
  api.post(`/votes/${voteId}/resolve/${choiceId}`);

// 🔹 보상 지급
export const rewardVote = (voteId) =>
  api.post(`/votes/${voteId}/admin/reward`);

// 🔹 투표 취소 (관리자)
export const cancelVoteAdmin = (voteId, reason) =>
  api.patch(`/votes/${voteId}/admin/cancel`, {
    reason,
  });


/** ------------------------------
 *  AI 자동 생성
 * ------------------------------ */

// 🔹 AI가 자동 생성한 투표 저장
export const createVoteByAI = (data) =>
  api.post(`/votes/ai-create`, data);
