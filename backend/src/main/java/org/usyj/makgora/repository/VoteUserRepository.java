package org.usyj.makgora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteUserEntity;

@Repository
public interface VoteUserRepository extends JpaRepository<VoteUserEntity, Long> {

    Optional<VoteUserEntity> findByUserIdAndVoteId(Integer userId, Integer voteId);

    boolean existsByUserIdAndVoteId(Integer userId, Integer voteId);

    boolean existsByUserAndChoice(UserEntity user, VoteOptionChoiceEntity choice);

    boolean existsByUserIdAndOptionId(Integer userId, Long optionId);

    boolean existsByUserIdAndChoiceId(Integer userId, Long choiceId);

    List<VoteUserEntity> findByChoiceId(Long choiceId);

    List<VoteUserEntity> findByVoteId(Integer voteId);

    List<VoteUserEntity> findByUserId(Integer userId);

    // 🔵 NormalVote 참여자 총 수
    int countByNormalVote_Id(Long normalVoteId);

    // 🔵 NormalVote 옵션별 참여자
    int countByNormalVote_IdAndOption_Id(Long normalVoteId, Long optionId);

    // 🔴 NormalVote 참여 기록
    Optional<VoteUserEntity> findByUserIdAndNormalVoteId(Integer userId, Long normalVoteId);

    // NormalVote 전체 투표 기록 가져오기
    List<VoteUserEntity> findByNormalVote_Id(Long normalVoteId);

    // NormalVote 선택지별 참여자 목록
    List<VoteUserEntity> findByNormalChoice_Id(Long normalChoiceId);

    int countByVote_IdAndChoice_Id(Integer voteId, Long choiceId);


    // 특정 NormalVoteOption 참여자 수
    int countByNormalChoice_NormalOption_Id(Long optionId);

    // 특정 NormalVoteChoice 참여자 수
    int countByNormalChoice_Id(Long choiceId);

    // 🔥 내가 참여한 일반투표 목록 조회 (mypage용)
    List<VoteUserEntity> findByUser_IdAndNormalVoteIsNotNull(Integer userId);

    /** NormalVote + User별 유일 투표(중복 금지) */
    VoteUserEntity findByNormalVote_IdAndUser_Id(Long normalVoteId, Integer userId);

    
}