package org.usyj.makgora.request.vote;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IssueCreateRequest {
    private String title;
    private String content;
}