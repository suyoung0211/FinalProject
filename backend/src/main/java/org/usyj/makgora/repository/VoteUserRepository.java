package org.usyj.makgora.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.entity.VoteOptionEntity;
import org.usyj.makgora.entity.VoteUserEntity;

@Repository
public interface VoteUserRepository extends JpaRepository<VoteUserEntity, Long> {

  List<VoteUserEntity> findByVoteId(Long voteId);

  List<VoteUserEntity> findByUserId(Long userId);

  boolean existsByUserIdAndVoteId(Long userId, Long voteId);

  Optional<VoteUserEntity> findByUserIdAndVoteId(Long userId, Long voteId);

  int countByOptionId(Long optionId);

  long countByVote(VoteEntity vote);

  long countByOption(VoteOptionEntity option);
}