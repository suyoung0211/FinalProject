// package org.usyj.makgora.config;

// import jakarta.annotation.PostConstruct;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Component;
// import org.usyj.makgora.entity.RankingEntity;
// import org.usyj.makgora.entity.RankingEntity.RankingType;
// import org.usyj.makgora.entity.UserEntity;
// import org.usyj.makgora.repository.RankingRepository;
// import org.usyj.makgora.repository.UserRepository;

// import java.util.Random;

// @Component
// @RequiredArgsConstructor
// public class RankingDataInitializer {

//     private final UserRepository userRepository;
//     private final RankingRepository rankingRepository;

//     private final Random random = new Random();

//     @PostConstruct
//     public void init() {

//         // 이미 데이터가 있다면 동작시키지 않음
//         if (userRepository.count() > 0) {
//             System.out.println("⭐ Users exist → skip dummy initialization");
//             return;
//         }

//         System.out.println("🚀 Initializing dummy users + ranking data ...");

//         for (int i = 1; i <= 20; i++) {

//             // 1) User 생성
//             UserEntity user = UserEntity.builder()
//                     .loginId("test" + i + "@example.com")
//                     .password("1234") // 테스트용
//                     .nickname("테스터" + i)
//                     .points(random.nextInt(50000))
//                     .build();

//             userRepository.save(user);

//             // 2) POINTS 랭킹 생성
//             RankingEntity pointsRanking = RankingEntity.builder()
//                     .user(user)
//                     .rankingType(RankingType.POINTS)
//                     .ranking(i)
//                     .score(user.getPoints())
//                     .build();

//             rankingRepository.save(pointsRanking);

//             // 3) WINRATE 랭킹 생성 (0~100)
//             RankingEntity winrateRanking = RankingEntity.builder()
//                     .user(user)
//                     .rankingType(RankingType.WINRATE)
//                     .ranking(i)
//                     .score(random.nextInt(101))
//                     .build();

//             rankingRepository.save(winrateRanking);

//             // 4) STREAK 랭킹 생성 (0~15)
//             RankingEntity streakRanking = RankingEntity.builder()
//                     .user(user)
//                     .rankingType(RankingType.STREAK)
//                     .ranking(i)
//                     .score(random.nextInt(16))
//                     .build();

//             rankingRepository.save(streakRanking);
//         }

//         System.out.println("🎉 Dummy initialization complete!");
//     }
// }