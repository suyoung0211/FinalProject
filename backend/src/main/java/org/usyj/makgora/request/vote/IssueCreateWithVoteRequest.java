package org.usyj.makgora.request.vote;

import lombok.Data;

@Data
public class IssueCreateWithVoteRequest {
    private String title;
    private String description;
    private String category;
    private String endAt; // "2025-01-10T18:00" 형태
}