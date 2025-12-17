package org.usyj.makgora.vote.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.usyj.makgora.vote.entity.VoteEntity;
import org.usyj.makgora.vote.entity.VoteStatusHistoryEntity;
import org.usyj.makgora.vote.repository.VotesStatusHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoteStatusHistoryService {

    private final VotesStatusHistoryRepository historyRepo;

    public void recordStatus(VoteEntity vote, VoteEntity.Status newStatus) {

        VoteStatusHistoryEntity history = VoteStatusHistoryEntity.builder()
                .vote(vote)
                .status(VoteStatusHistoryEntity.Status.valueOf(newStatus.name()))
                .statusDate(LocalDateTime.now())
                .build();

        historyRepo.save(history);
    }
}