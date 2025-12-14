package org.usyj.makgora.response.home;

import lombok.*;
import java.util.List;

import org.usyj.makgora.dto.home.AiBannerDto;
import org.usyj.makgora.dto.home.HotIssueDto;
import org.usyj.makgora.dto.home.SlideNewsDto;
import org.usyj.makgora.dto.home.TopVoteDto;
import org.usyj.makgora.dto.home.VoteListDto;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor 
@Builder
public class HomeResponse {

    private List<SlideNewsDto> newsSlides;   // 뉴스 슬라이드
    private List<HotIssueDto> latestIssues;  // 최신 뉴스 20개
    private List<HotIssueDto> hotIssues;
    private List<VoteListDto> voteList;      // 🔥 전체 투표 목록 추가
}