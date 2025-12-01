package org.usyj.makgora.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.entity.RankingEntity;
import org.usyj.makgora.entity.RankingEntity.RankingType;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.RankingRepository;
import org.usyj.makgora.repository.UserRepository;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class DummyDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RankingRepository rankingRepository;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {

        // 이미 랭킹 데이터가 있으면 더미 생성 안 함 (20명까지만)
        if (rankingRepository.count() > 0) {
            System.out.println("⭐ Rankings already exist. Skip dummy init.");
            return;
        }

        System.out.println("🚀 Inserting 20 dummy users + rankings ...");

        for (int i = 1; i <= 20; i++) {

            // 1) 유저 생성
            UserEntity user = new UserEntity();
            user.setLoginId("test" + i + "@example.com");
            user.setPassword("1234");           // 테스트용, 나중에 인코딩
            user.setNickname("테스터" + i);
            user.setPoints(random.nextInt(50_000));

            user = userRepository.save(user);

            // 2) 포인트 랭킹
            RankingEntity pointsRank = RankingEntity.builder()
                    .user(user)
                    .rankingType(RankingType.points)
                    .ranking(i)
                    .score(user.getPoints())
                    .build();
            rankingRepository.save(pointsRank);

            // 3) 승률 랭킹 (0 ~ 100)
            RankingEntity winrateRank = RankingEntity.builder()
                    .user(user)
                    .rankingType(RankingType.winrate)
                    .ranking(i)
                    .score(random.nextInt(101))
                    .build();
            rankingRepository.save(winrateRank);

            // 4) 연승 랭킹 (0 ~ 15)
            RankingEntity streakRank = RankingEntity.builder()
                    .user(user)
                    .rankingType(RankingType.streak)
                    .ranking(i)
                    .score(random.nextInt(16))
                    .build();
            rankingRepository.save(streakRank);
        }

        System.out.println("🎉 Dummy rankings initialized!");
    }
}