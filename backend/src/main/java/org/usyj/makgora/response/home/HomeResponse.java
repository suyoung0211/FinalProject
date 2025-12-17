package org.usyj.makgora.response.home;

import lombok.*;
import java.util.List;

import org.usyj.makgora.home.dto.response.AiBannerResponse;
import org.usyj.makgora.home.dto.response.HotIssueResponse;
import org.usyj.makgora.home.dto.response.SlideNewsResponse;
import org.usyj.makgora.home.dto.response.TopVoteResponse;
import org.usyj.makgora.home.dto.response.VoteListResponse;

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