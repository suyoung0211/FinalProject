import api from "./api";

// 투표 상세 조회
export const fetchVoteDetail = (voteId) =>
  api.get(`/votes/${voteId}`);

// 투표 참여
export const participateVote = (voteId, choiceId, points) =>
  api.post(`/votes/${voteId}/participate`, {
    choiceId,
    points,
  });

// 🔥 투표 목록 조회 API 추가 (VoteListPage에서 사용 중)
export const fetchVoteList = () =>
  api.get(`/votes`);

// 내가 해당 투표에서 한 선택 조회
export const fetchMyVote = (voteId) =>
  api.get(`/votes/${voteId}/my`);

// 내가 한 투표 취소
export const cancelMyVote = (voteUserId) =>
  api.patch(`/votes/my/${voteUserId}/cancel`);

// 관리자: 투표 종료
export const finishVote = (voteId) =>
  api.post(`/votes/${voteId}/finish`);

// 관리자: 정답 확정
export const resolveVote = (voteId, choiceId) =>
  api.post(`/votes/${voteId}/resolve/${choiceId}`);

// 관리자: 보상 지급
export const rewardVote = (voteId) =>
  api.post(`/votes/${voteId}/reward`);

// 관리자: 투표 취소
export const cancelVoteAdmin = (voteId, reason) =>
  api.patch(`/votes/${voteId}/admin/cancel`, {
    reason,
  });
