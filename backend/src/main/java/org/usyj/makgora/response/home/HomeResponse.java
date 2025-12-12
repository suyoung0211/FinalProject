package org.usyj.makgora.response.home;

import lombok.*;
import java.util.List;

import org.usyj.makgora.dto.home.AiBannerDto;
import org.usyj.makgora.dto.home.HotIssueDto;
import org.usyj.makgora.dto.home.SlideNewsDto;
import org.usyj.makgora.dto.home.TopVoteDto;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class HomeResponse {
    private List<SlideNewsDto> newsSlides;
    private List<TopVoteDto> topVotes;
    private List<HotIssueDto> hotIssues;
    private AiBannerDto aiBanner;
    private List<HotIssueDto> latestIssues;
}