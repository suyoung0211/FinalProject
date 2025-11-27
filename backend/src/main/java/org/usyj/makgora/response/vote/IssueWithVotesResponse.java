package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import org.usyj.makgora.entity.IssueEntity;

import java.util.List;

@Getter
@Setter
@Builder
public class IssueWithVotesResponse {

    private Integer issueId;
    private String title;
    private String content;
    private String thumbnail;

    private List<VoteResponse> votes;

    public static IssueWithVotesResponse of(IssueEntity issue, List<VoteResponse> votes) {
        return IssueWithVotesResponse.builder()
                .issueId(issue.getId())
                .title(issue.getTitle())
                .content(issue.getContent())
                .thumbnail(issue.getThumbnail())
                .votes(votes)
                .build();
    }
}

