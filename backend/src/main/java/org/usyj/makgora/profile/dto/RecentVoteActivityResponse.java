package org.usyj.makgora.profile.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 프로필 > 최근 활동 탭에서 사용하는
 * "내 투표 활동" 요약 DTO
 */
@Getter
@Builder
public class RecentVoteActivityResponse {

    /** Vote_Users PK (한 번의 베팅 내역 ID) */
    private Integer voteUserId;

    /** 투표 PK */
    private Integer voteId;

    /** 투표 제목 (예: 비트코인 15만달러 돌파?) */
    private String voteTitle;

    /** 이슈 제목 (예: 2025년 비트코인 전망) */
    private String issueTitle;

    /** 내가 선택한 choice 정보 */
    private Integer choiceId;
    private String choiceText;

    /** 내가 건 포인트 */
    private Integer pointsBet;

    /**
     * 정산 이후의 순이익/순손실
     *  - WIN  : +120 같은 값
     *  - LOSE : -200
     *  - PENDING / RESOLVED(정산 전) : null
     *  - CANCELLED : 0
     */
    private Integer rewardAmount;

    /**
     * 최종 결과 상태
     *  - WIN / LOSE / PENDING / CANCELLED
     *  - (정산 전이지만 정답은 확정된 경우 → WIN/LOSE, rewardAmount 는 null)
     */
    private String result;

    /** 투표 생성일 (언제 만들어진 투표인지) */
    private LocalDateTime voteCreatedAt;

    /** 투표 종료 시각 */
    private LocalDateTime voteEndAt;

    /** 내가 베팅한 시각 (정렬 기준) */
    private LocalDateTime createdAt;
}
