package org.usyj.makgora.request.voteDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VoteDetailParticipateCancelRequest {
    private Long voteUserId; // 내가 한 참여 1건
}