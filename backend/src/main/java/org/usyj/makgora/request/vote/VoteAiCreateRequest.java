package org.usyj.makgora.request.vote;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Python AI Worker가 호출하는 전용 투표 생성 요청 DTO
 */
@Getter
@Setter
public class VoteAiCreateRequest {

    /** 🔗 어떤 이슈에 대한 투표인지 */
    private Integer issueId;

    /** 🤖 AI가 만든 투표 질문 */
    private String question;

    /** 🤖 AI가 만든 선택지 목록 (예: ["예", "아니오"]) */
    private List<String> options;

    /** 📅 투표 종료 시간 (AI 쪽에서 기본 7일 뒤로 계산해서 넘겨줌) */
    private LocalDateTime endAt;

    /** 🧾 투표 룰 타입 (예: BASIC, SPECIAL 등) */
    private String ruleType;

    /** 🧾 투표 룰 설명 (사람이 읽을 수 있는 문장) */
    private String ruleDescription;

    /** 초기 상태 이력용 코드 (예: REVIEW = 심사중) */
    private String initialStatus;
}
