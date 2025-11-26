package org.usyj.makgora.request.vote;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteCreateRequest {
    private String title;
    private String endAt; // ISO-8601 문자열
}