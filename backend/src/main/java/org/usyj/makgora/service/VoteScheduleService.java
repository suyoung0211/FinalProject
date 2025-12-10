package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.repository.VoteRepository;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteScheduleService {

    private final VoteRepository voteRepository;
    private final VoteService voteService;

    /**
     * 🇰🇷 한국 시간(Asia/Seoul) 기준 "매 정시(00분)"마다 실행
     * cron = "0 0 * * * *"
     *   - 초  분  시  일  월  요일
     */
    @Scheduled(cron = "0 0 * * * *", zone = "Asia/Seoul")
    @Transactional
    public void autoFinishVotes() {

        LocalDateTime now = LocalDateTime.now();
        log.info("[VoteScheduler] 자동 마감 체크 시작 now={}", now);

        // 진행중 + 마감시간이 지난 투표 조회
        List<VoteEntity> targets = voteRepository.findByStatusAndEndAtBefore(
                VoteEntity.Status.ONGOING,
                now
        );

        if (targets.isEmpty()) {
            log.info("[VoteScheduler] 마감 대상 투표 없음");
            return;
        }

        log.info("[VoteScheduler] 마감 대상 투표 개수 = {}", targets.size());

        for (VoteEntity v : targets) {
            try {
                log.info("[VoteScheduler] 투표 자동 마감 처리 voteId={}", v.getId());
                voteService.finishVote(v.getId());   // ✅ 이미 만들어둔 마감 로직 재사용
            } catch (Exception e) {
                log.error("[VoteScheduler] 투표 자동 마감 실패 voteId={}", v.getId(), e);
            }
        }
    }
}
