package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.NormalVoteEntity;
import org.usyj.makgora.repository.NormalVoteRepository;
import org.usyj.makgora.request.voteDetails.NormalVoteUpdateRequest;

@Service
@RequiredArgsConstructor
public class NormalVoteUpdateService {

    private final NormalVoteRepository normalVoteRepository;

    @Transactional
    public String update(Long normalVoteId, Integer userId, NormalVoteUpdateRequest req) {

        NormalVoteEntity vote = normalVoteRepository.findById(normalVoteId)
                .orElseThrow(() -> new RuntimeException("NormalVote not found"));

        if (!vote.getUser().getId().equals(userId)) {
            throw new RuntimeException("작성자만 수정할 수 있습니다.");
        }

        if (vote.getStatus() != NormalVoteEntity.Status.ONGOING) {
            throw new RuntimeException("진행 중인 투표만 수정 가능합니다.");
        }

        if (req.getTitle() != null) vote.setTitle(req.getTitle());
        if (req.getDescription() != null) vote.setDescription(req.getDescription());
        if (req.getCategory() != null) vote.setCategory(req.getCategory());
        if (req.getEndAt() != null) vote.setEndAt(req.getEndAt());

        return "NORMAL_VOTE_UPDATED";
    }
}
