import api from "./api";

/* ==========================================================
 * 유저: 투표 조회
 * ========================================================== */

export const fetchVoteList = () =>
  api.get(`/votes`);

export const fetchVoteDetail = (voteId) =>
  api.get(`/votes/${voteId}`);

export const fetchVoteOdds = (voteId) =>
  api.get(`/votes/${voteId}/odds`);

export const fetchExpectedOdds = (voteId, choiceId, amount) =>
  api.get(`/votes/${voteId}/expected-odds`, {
    params: { choiceId, amount },
  });

export const fetchMyParticipation = (voteId) =>
  api.get(`/votes/${voteId}/my`);

// 📊 투표 배당률 히스토리 차트
export const fetchVoteTrendChart = (voteId) =>
  api.get(`/votes/${voteId}/trend-chart`);

/* ==========================================================
 * 유저: 투표 참여
 * ========================================================== */

export const participateVote = (voteId, choiceId, points) =>
  api.post(`/votes/${voteId}/participate`, {
    choiceId,
    points,
  });

export const cancelVote = (voteId) =>
  api.patch(`/votes/${voteId}/cancel`);

export const cancelMyVote = (voteUserId) =>
  api.patch(`/votes/my/${voteUserId}/cancel`);

/* ==========================================================
 * 유저: 마이페이지
 * ========================================================== */

export const fetchMyVotes = () =>
  api.get(`/votes/my`);

export const fetchVoteStatistics = () =>
  api.get(`/votes/my/statistics`);

/* ==========================================================
 * 유저: 투표 생성
 * ========================================================== */

export const createVoteByUser = (data) =>
  api.post(`/votes`, data);

export const createVoteByAI = (data) =>
  api.post(`/votes/ai-create`, data);
