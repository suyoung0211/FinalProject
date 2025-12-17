package org.usyj.makgora.normalVote.dto.request;


import lombok.Data;

@Data
public class NormalVoteStatusUpdateRequest {
    private String status;  // FINISHED, CANCELLED
}