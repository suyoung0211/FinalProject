package org.usyj.makgora.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalVotes;
    private long totalCommunityPosts;
}
