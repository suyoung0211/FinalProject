package org.usyj.makgora.request.vote;


import lombok.Data;

@Data
public class NormalVoteStatusUpdateRequest {
    private String status;  // FINISHED, CANCELLED
}