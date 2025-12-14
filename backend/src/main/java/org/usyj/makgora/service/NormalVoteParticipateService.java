package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.*;
import org.usyj.makgora.repository.*;

@Service
@RequiredArgsConstructor
public class NormalVoteParticipateService {

    private final NormalVoteRepository normalVoteRepository;
    private final NormalVoteChoiceRepository choiceRepository;
    private final VoteUserRepository voteUserRepository;
    private final UserRepository userRepository;

    @Transactional
    public String participate(Integer normalVoteId, Integer choiceId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        if (vote.getStatus() != NormalVoteEntity.Status.ONGOING) {
            throw new RuntimeException("이미 종료된 투표입니다.");
        }

        NormalVoteChoiceEntity choice = choiceRepository.findById(choiceId)
                .orElseThrow(() -> new RuntimeException("Choice not found"));

        if (!choice.getNormalOption().getNormalVote().getId().equals(normalVoteId.longValue())) {
            throw new RuntimeException("해당 선택지는 이 투표에 속하지 않습니다.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 중복 참여 방지
        Optional<VoteUserEntity> existing = 
    voteUserRepository.findByNormalVote_IdAndUser_Id(normalVoteId, userId);

if (existing.isPresent()) {
    throw new RuntimeException("이미 참여한 투표입니다.");
}

        // 참여 저장
        VoteUserEntity voteUser = VoteUserEntity.builder()
                .normalVote(vote)
                .normalChoice(choice)
                .user(user)
                .isCancelled(false)
                .build();

        voteUserRepository.save(voteUser);

        // 카운트 증가
        choice.setParticipantsCount(choice.getParticipantsCount() + 1);
        vote.setTotalParticipants(vote.getTotalParticipants() + 1);

        return "NORMAL_VOTE_PARTICIPATED";
    }
}
