package org.usyj.makgora.vote.dto.voteDetailResponse;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 투표 상세 전체 Response Root
 */
@Data
@Builder
public class VoteDetailMainResponse {

    private Integer voteId;
    private String type;               // AI / NORMAL
    private String title;
    private String description;
    private String category;

    // ❌ 전체 단일 correctChoiceId는 의미 불일치 → 유지하되 deprecated
    @Deprecated
    private Integer correctChoiceId;

    // ✅ 옵션별 정답 choice
    private Map<Integer, Integer> correctChoicesByOption;

    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime endAt;

    private Integer totalParticipants; // 전체 참여자 수
    private Long totalPoints;          // 전체 베팅 포인트

    private VoteDetailArticleResponse article;
    private List<VoteDetailOptionResponse> options;

    // 🔥 의미 변경: 옵션 기준 배당률
    private VoteDetailOddsResponse odds;

    private VoteDetailStatisticsResponse statistics;

    private VoteDetailParticipationResponse myParticipation;
    private List<VoteDetailCommentResponse> comments;

    // 선택지별 참여자 요약 (기존 기능 유지)
    private List<VoteDetailBettorSummaryResponse> bettors;

    private Boolean isResolved;
    private Boolean isRewarded;

    private VoteDetailSettlementSummaryResponse settlementSummary;

    // 🔥 option 기준 시뮬레이션 결과
    private Double expectedOdds;
    private Integer expectedReward;

    private List<VoteActivityLogResponse> activityLog;
}
