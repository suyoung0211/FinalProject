package org.usyj.makgora.response.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.usyj.makgora.entity.VoteUserEntity;
import org.usyj.makgora.entity.VoteEntity;

@Getter
@Setter
@Builder
public class MyVoteResponse {

    private Integer voteId;
    private String title;
    private Long myChoiceId;
    private Integer myPoints;

    public static MyVoteResponse from(VoteEntity vote, VoteUserEntity voted) {
        return MyVoteResponse.builder()
                .voteId(vote.getId())
                .title(vote.getTitle())
                .myChoiceId(voted != null ? voted.getChoice().getId() : null)
                .myPoints(voted != null ? voted.getPointsBet() : null)
                .build();
    }
}
