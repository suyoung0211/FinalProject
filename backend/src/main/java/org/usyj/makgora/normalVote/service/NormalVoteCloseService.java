package org.usyj.makgora.normalVote.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.normalVote.entity.NormalVoteEntity;
import org.usyj.makgora.normalVote.repository.NormalVoteRepository;

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
