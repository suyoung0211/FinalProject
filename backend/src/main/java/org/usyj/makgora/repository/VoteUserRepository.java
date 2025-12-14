package org.usyj.makgora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.VoteOptionChoiceEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.entity.VoteUserEntity;

@Repository
public interface VoteUserRepository extends JpaRepository<VoteUserEntity, Long> {

    /* ===============================
       AI Vote
       =============================== */

    Optional<VoteUserEntity> findByUserIdAndVoteId(Integer userId, Integer voteId);

    boolean existsByUserIdAndVoteId(Integer userId, Integer voteId);

    List<VoteUserEntity> findByVoteId(Integer voteId);

    List<VoteUserEntity> findByUserId(Integer userId);


    /* ===============================
       Normal Vote
       =============================== */

    Optional<VoteUserEntity> findByNormalVote_IdAndUser_Id(Integer voteId, Integer userId);

    // 🔵 NormalVote 참여자 총 수
    int countByNormalVote_Id(Integer normalVoteId);

    // 🔵 NormalVote 옵션별 참여자
    int countByNormalVote_IdAndOption_Id(Integer normalVoteId, Integer optionId);

    // 🔴 NormalVote 참여 기록
    Optional<VoteUserEntity> findByUserIdAndNormalVoteId(Integer userId, Integer normalVoteId);

    // NormalVote 전체 투표 기록
    List<VoteUserEntity> findByNormalVote_Id(Integer normalVoteId);

    // NormalVote 선택지별 참여자 목록
    List<VoteUserEntity> findByNormalChoice_Id(Integer normalChoiceId);

    // 특정 NormalVoteOption 참여자 수
    int countByNormalChoice_NormalOption_Id(Long optionId);

    // 특정 NormalVoteChoice 참여자 수
    int countByNormalChoice_Id(Integer choiceId);

    // 🔥 내가 참여한 일반투표 목록 조회 (mypage용)
    List<VoteUserEntity> findByUser_IdAndNormalVoteIsNotNull(Integer userId);

     /* =========================
       AI Vote (비율 베팅)
       ========================= */

    // 🔥 voteId 기준 전체 베팅 조회 (정산용)
    List<VoteUserEntity> findByVote_Id(Integer voteId);

    // 🔥 choice 기준 총 베팅 포인트 합
@Query("""
    select coalesce(sum(v.pointsBet), 0)
    from VoteUserEntity v
    where v.choice.id = :choiceId
      and v.isCancelled = false
""")
int sumPointsByChoiceId(@Param("choiceId") Integer choiceId);

    // 🔥 vote + choice 기준 참여자 수
    int countByVote_IdAndChoice_Id(Integer voteId, Integer choiceId);

    // 🔥 option 기준 총 베팅 포인트 합
    @Query("""
        select coalesce(sum(v.pointsBet), 0)
        from VoteUserEntity v
        where v.option.id = :optionId
          and v.isCancelled = false
    """)
    int sumPointsByOptionId(@Param("optionId") Integer optionId);

    // 🔥 AI Vote 전체 베팅 포인트 합
@Query("""
    select coalesce(sum(v.pointsBet), 0)
    from VoteUserEntity v
    where v.vote.id = :voteId
      and v.isCancelled = false
""")
int sumPointsByVoteId(@Param("voteId") Integer voteId);

// 🔥 AI Vote 전체 참여자 수 (중복 유저 제거)
@Query("""
    select count(distinct v.user.id)
    from VoteUserEntity v
    where v.vote.id = :voteId
      and v.isCancelled = false
""")
int countParticipantsByVoteId(@Param("voteId") Integer voteId);

    // 🔥 option 기준 참여자 수
    @Query("""
        select count(v)
        from VoteUserEntity v
        where v.option.id = :optionId
          and v.isCancelled = false
    """)
    int countParticipantsByOptionId(@Param("optionId") Integer optionId);
}