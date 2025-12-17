package org.usyj.makgora.home.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor 
@Builder
public class HomeResponse {

    private List<SlideNewsResponse> newsSlides;   // 뉴스 슬라이드
    private List<HotIssueResponse> latestIssues;  // 최신 뉴스 20개
    private List<HotIssueResponse> hotIssues;
    private List<VoteListResponse> voteList;      // 🔥 전체 투표 목록 추가
}