package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.repository.NormalVoteRepository;
import org.usyj.makgora.vote.entity.NormalVoteEntity;

@Service
@RequiredArgsConstructor
public class NormalVoteDeleteService {

    private final NormalVoteRepository normalVoteRepository;

    @Transactional
    public String delete(Integer normalVoteId, Integer userId) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        if (!vote.getUser().getId().equals(userId)) {
            throw new RuntimeException("작성자만 삭제할 수 있습니다.");
        }

        normalVoteRepository.delete(vote);

        return "NORMAL_VOTE_DELETED";
    }
}
