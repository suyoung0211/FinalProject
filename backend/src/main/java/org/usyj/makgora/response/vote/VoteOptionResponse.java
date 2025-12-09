package org.usyj.makgora.response.vote;

import java.util.List;

import lombok.*;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class VoteOptionResponse {
    private Long id;
    private String label;
    private Integer totalParticipants;
    private List<VoteChoiceResponse> choices;
}
