package org.usyj.makgora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.entity.CommentReactionEntity;

public interface CommentReactionRepository extends JpaRepository<CommentReactionEntity, Long> {
    Optional<CommentReactionEntity> findByComment_IdAndUser_Id(Long commentId, Long userId);

    long countByComment_IdAndReactionValue(Long commentId, Integer value);
}
