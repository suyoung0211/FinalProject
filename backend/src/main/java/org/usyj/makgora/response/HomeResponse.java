package org.usyj.makgora.response;

import lombok.*;
import java.util.List;

import org.usyj.makgora.dto.AiBannerDto;
import org.usyj.makgora.dto.HotIssueDto;
import org.usyj.makgora.dto.SlideNewsDto;
import org.usyj.makgora.dto.TopVoteDto;

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