package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.dto.CommunityCommentRequest;
import org.usyj.makgora.community.dto.CommunityCommentResponse;
import org.usyj.makgora.entity.CommunityCommentEntity;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.repository.UserRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityCommentService {

    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostReactionService postReactionService;
    private final UserRepository userRepository;
    private final StringRedisTemplate redis;

    private String commentKey(Long commentId, String type) {
        return "cc:" + commentId + ":" + type;
    }

    private long getCommentCount(Long commentId, String type, CommunityCommentEntity entity) {
        String v = redis.opsForValue().get(commentKey(commentId, type));
        if (v != null) {
            return Long.parseLong(v);
        }
        // Redis에 값이 없으면 DB 값 사용 및 동기화
        long dbValue = 0L;
        if ("like".equals(type)) {
            dbValue = (entity.getLikeCount() != null) ? entity.getLikeCount().longValue() : 0L;
        } else if ("dislike".equals(type)) {
            dbValue = (entity.getDislikeCount() != null) ? entity.getDislikeCount().longValue() : 0L;
        }
        // Redis에 동기화
        redis.opsForValue().set(commentKey(commentId, type), String.valueOf(dbValue));
        return dbValue;
    }

    /** 댓글 목록 조회 */
    @Transactional(readOnly = true)
    public List<CommunityCommentResponse> getCommentsByPost(Long postId, Integer currentUserId) {

        communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        List<CommunityCommentEntity> entities =
                communityCommentRepository.findByPost_PostIdOrderByCreatedAtAsc(postId);

        Map<Long, CommunityCommentResponse> dtoMap = new LinkedHashMap<>();

        for (CommunityCommentEntity entity : entities) {
            dtoMap.put(entity.getCommentId(), toResponse(entity, currentUserId));
        }

        List<CommunityCommentResponse> roots = new ArrayList<>();

        for (CommunityCommentEntity entity : entities) {

            Long commentId = entity.getCommentId();
            Long parentId = (entity.getParent() != null) ? entity.getParent().getCommentId() : null;

            CommunityCommentResponse dto = dtoMap.get(commentId);

            if (parentId == null) {
                roots.add(dto);
            } else {
                dtoMap.get(parentId).getReplies().add(dto);
            }
        }

        return roots;
    }

    /** 댓글 작성 */
    public CommunityCommentResponse createComment(
            Long postId,
            Integer userId,
            CommunityCommentRequest request
    ) {

        CommunityPostEntity post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        CommunityCommentEntity parent = null;

        if (request.getParentCommentId() != null) {
            parent = communityCommentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글을 찾을 수 없습니다."));
        }

        CommunityCommentEntity saved = communityCommentRepository.save(
                CommunityCommentEntity.builder()
                        .post(post)
                        .user(user)
                        .parent(parent)
                        .content(request.getContent())
                        .build()
        );

        Long commentId = saved.getCommentId();

        // 🔥 댓글 좋아요/싫어요 Redis 초기값 세팅
        redis.opsForValue().set(commentKey(commentId, "like"), "0");
        redis.opsForValue().set(commentKey(commentId, "dislike"), "0");

        // 🔥 게시글 댓글 수 증가 (Redis Only)
        postReactionService.addComment(postId);

        return toResponse(saved, userId);
    }

    /** 댓글 수정 */
    public CommunityCommentResponse updateComment(
            Long commentId,
            Integer userId,
            CommunityCommentRequest request
    ) {

        CommunityCommentEntity comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(request.getContent());
        CommunityCommentEntity saved = communityCommentRepository.save(comment);
        return toResponse(saved, userId);
    }

    /** 댓글 삭제 */
    public void deleteComment(Long commentId, Integer userId) {

        CommunityCommentEntity comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        communityCommentRepository.delete(comment);

        // 🔥 댓글 감소는 정책에 따라 선택
        // postReactionService.decreaseComment(comment.getPost().getPostId());
    }

    /** DTO 변환 */
    private CommunityCommentResponse toResponse(CommunityCommentEntity entity, Integer currentUserId) {

        boolean mine = (currentUserId != null) &&
                entity.getUser().getId().equals(currentUserId);

        long likeCount = getCommentCount(entity.getCommentId(), "like", entity);
        long dislikeCount = getCommentCount(entity.getCommentId(), "dislike", entity);

        return CommunityCommentResponse.builder()
                .commentId(entity.getCommentId())
                .postId(entity.getPost().getPostId())
                .parentCommentId(entity.getParent() != null ?
                        entity.getParent().getCommentId() : null)
                .userId(entity.getUser().getId())
                .nickname(entity.getUser().getNickname())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .mine(mine)
                .replies(new ArrayList<>())
                .build();
    }
}
