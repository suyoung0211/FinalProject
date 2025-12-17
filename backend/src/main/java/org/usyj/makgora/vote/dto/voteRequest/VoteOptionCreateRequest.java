// src/main/java/org/usyj/makgora/request/vote/VoteOptionCreateRequest.java
package org.usyj.makgora.vote.dto.voteRequest;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class VoteOptionCreateRequest {

    /** VoteOption.optionTitle */
    private String optionTitle;

    /** VoteOptionChoice.choiceText 리스트: ["YES","NO"] 또는 ["YES","NO","DRAW"] */
    private List<String> choices;
}
