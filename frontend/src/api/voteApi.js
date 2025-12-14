import api from "./api";

/* ==========================================================
 *  1) 기본 조회
 * ========================================================== */

// 🔹 투표 기본 정보 조회 (간단 버전)
export const fetchVoteDetail = (voteId) =>
  api.get(`/votes/${voteId}`);

// 🔹 배당률 조회
export const fetchVoteOdds = (voteId) =>
  api.get(`/votes/${voteId}/odds`);

// 🔹 투표 리스트 조회
export const fetchVoteList = () =>
  api.get(`/votes`);

export const fetchExpectedOdds = (voteId, choiceId, amount) =>
  api.get(`/votes/${voteId}/expected-odds`, {
    params: { choiceId, amount },
  });

/* ==========================================================
 *  2) 참여 관련
 * ========================================================== */

// 🔹 투표 참여
export const participateVote = (voteId, choiceId, points) =>
  api.post(`/votes/${voteId}/participate`, {
    choiceId,
    points,
  });

// 🔹 내가 특정 투표에서 한 참여 1건 취소 (vote_user_id 기반)
export const cancelMyVote = (voteUserId) =>
  api.patch(`/votes/my/${voteUserId}/cancel`);

// 🔹 해당 투표에서 나의 참여 취소
export const cancelVote = (voteId) =>
  api.patch(`/votes/${voteId}/cancel`);

// 🔹 해당 투표에서 내 참여 정보만 조회
export const fetchMyParticipation = (voteId) =>
  api.get(`/votes/${voteId}/my`);


/* ==========================================================
 *  3) 마이페이지 관련
 * ========================================================== */

// 🔹 내가 참여한 모든 투표 조회
export const fetchMyVotes = () =>
  api.get(`/votes/my`);

// 🔹 내 전체 투표 통계 조회
export const fetchVoteStatistics = () =>
  api.get(`/votes/my/statistics`);


/* ==========================================================
 *  4) 관리자 / 운영 기능
 * ========================================================== */

// 🔹 투표 종료
export const finishVote = (voteId) =>
  api.patch(`/votes/${voteId}/finish`);

// 🔹 보상 지급
export const rewardVote = (voteId) =>
  api.patch(`/votes/${voteId}/reward`);

// 🔹 정답 선택 + 정산(동시 진행)
export const resolveAndSettleVoteV2 = (voteId, body) =>
  api.post(`/votes/${voteId}/resolve`, body);

// 🔹 이미 correctChoice 있는 투표 정산만
export const settleVoteV2 = (voteId) =>
  api.post(`/votes/${voteId}/settle`);


/* ==========================================================
 *  5) 투표 생성 기능
 * ========================================================== */

// 🔹 AI 생성 투표 저장
export const createVoteByAI = (data) =>
  api.post(`/votes/ai-create`, data);

// 🔹 유저가 직접 생성한 투표 저장
export const createVoteByUser = (data) =>
  api.post(`/votes/create`, data);
