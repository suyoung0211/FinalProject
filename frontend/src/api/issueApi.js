import api from "./api";

// 추천 이슈
export const fetchRecommendedIssues = () =>
  api.get("/issues/recommended");

// 최신 이슈
export const fetchLatestIssues = () =>
  api.get("/issues/latest");

// 단일 이슈 상세
export const fetchIssueDetail = (issueId) =>
  api.get(`/issues/${issueId}`);

// 단일 이슈의 투표 목록
export const fetchIssueVotes = (issueId) =>
  api.get(`/issues/${issueId}/votes`);

// 이슈에 투표 생성 (관리자/에디터)
export const createVoteForIssue = (issueId, data) =>
  api.post(`/issues/${issueId}/votes`, data);
