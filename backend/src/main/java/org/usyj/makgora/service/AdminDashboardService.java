package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.repository.*;
import org.usyj.makgora.response.AdminDashboardStatsResponse;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final VoteRepository voteRepository;               // AI Vote
    private final NormalVoteRepository normalVoteRepository;   // Normal Vote
    private final CommunityPostRepository communityPostRepository;

    public AdminDashboardStatsResponse getDashboardStats() {

        long totalUsers = userRepository.count();
        long totalVotes =
                voteRepository.count() + normalVoteRepository.count();
        long totalCommunityPosts = communityPostRepository.count();

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalVotes(totalVotes)
                .totalCommunityPosts(totalCommunityPosts)
                .build();
    }
}