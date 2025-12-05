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
}