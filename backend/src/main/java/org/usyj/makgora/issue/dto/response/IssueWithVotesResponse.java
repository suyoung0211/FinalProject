package org.usyj.makgora.issue.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

import org.usyj.makgora.vote.entity.VoteEntity;

@Data
@Builder
@AllArgsConstructor
public class IssueWithVotesResponse {

    private IssueResponse issue;
    private List<VoteEntity> votes;
}