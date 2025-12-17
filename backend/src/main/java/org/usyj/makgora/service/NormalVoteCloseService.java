package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.repository.NormalVoteRepository;
import org.usyj.makgora.vote.entity.NormalVoteEntity;

@Service
@RequiredArgsConstructor
public class NormalVoteCloseService {

    private final NormalVoteRepository normalVoteRepository;

    @Transactional
    public String close(Integer normalVoteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        if (!vote.getUser().getId().equals(userId)) {
            throw new RuntimeException("작성자만 마감할 수 있습니다.");
        }

        vote.setStatus(NormalVoteEntity.Status.FINISHED);
        return "NORMAL_VOTE_FINISHED";
    }
}
