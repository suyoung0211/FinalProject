package org.usyj.makgora.response.issue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

import org.usyj.makgora.entity.VoteEntity;

@Data
@Builder
@AllArgsConstructor
public class IssueWithVotesResponse {

    private IssueResponse issue;
    private List<VoteEntity> votes;
}