package org.usyj.makgora.admin.service;

import org.springframework.stereotype.Service;
import org.usyj.makgora.admin.dto.response.AdminDashboardStatsResponse;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.normalVote.repository.NormalVoteRepository;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.vote.repository.VoteRepository;

import lombok.RequiredArgsConstructor;

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