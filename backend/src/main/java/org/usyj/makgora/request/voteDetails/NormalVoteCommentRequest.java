package org.usyj.makgora.request.voteDetails;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NormalVoteCommentRequest {

    private Long normalVoteId;
    private String content;
    private Long parentId;
}
