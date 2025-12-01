package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.repository.VoteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class VoteSettlementScheduler {

    private final VoteRepository voteRepository;
    private final VoteService voteService;

    /** 🔥 1분마다 상태 확인 */
    @Scheduled(cron = "0 */1 * * * *")
    public void settleVotes() {

        LocalDateTime now = LocalDateTime.now();

        // 1) 종료 시각 지났는데 아직 FINISHED 아닌 투표 → 자동 종료
        List<VoteEntity> toFinish = voteRepository.findByStatusAndEndAtBefore(
                VoteEntity.Status.ONGOING, now
        );

        for (VoteEntity v : toFinish) {
            v.setStatus(VoteEntity.Status.FINISHED);
            voteRepository.save(v);
            log.info("[투표 종료] voteId = {}", v.getId());
        }

        // 2) 정답은 확정됐는데 아직 보상 배분 안된 투표
        List<VoteEntity> toReward = voteRepository.findByStatus(VoteEntity.Status.RESOLVED);

        for (VoteEntity v : toReward) {
            if (!Boolean.TRUE.equals(v.getRewarded())) {
                voteService.rewardVote(v.getId());
                log.info("[자동 결산 완료] voteId = {}", v.getId());
            }
        }
    }
}