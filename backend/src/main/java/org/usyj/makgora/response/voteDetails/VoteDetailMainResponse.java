package org.usyj.makgora.response.voteDetails;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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

    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime endAt;

    private Integer totalParticipants; // 전체 참여자 수
    private Long totalPoints;          // 전체 베팅 포인트

    private VoteDetailArticleResponse article;       // 기사 정보
    private List<VoteDetailOptionResponse> options;  // 옵션 리스트
    private VoteDetailOddsResponse odds;             // 배당률
    private VoteDetailStatisticsResponse statistics; // 트렌드 그래프, 통계

    private VoteDetailParticipationResponse myParticipation; // 내 참여 정보
    private List<VoteDetailCommentResponse> comments;         // 댓글 부분
    // 선택지별 참여자 목록
    private List<VoteDetailBettorSummaryResponse> bettors;

    // 정답 확정 여부 + 정답 선택지 ID
    private Integer correctChoiceId;
    private Boolean isResolved;
    private Boolean isRewarded;
    // 정산 요약
    private VoteDetailSettlementSummaryResponse settlementSummary;
    // 내 포지션 상태 + 예상 수익률
    private Double expectedOdds; 
    private Integer expectedReward; 
    private List<VoteActivityLogResponse> activityLog;
}
