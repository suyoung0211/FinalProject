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
    private final CommunityCommentReactionService communityCommentReactionService;

    /** Redis count 가져오기 */
    private long getCount(String key) {
        String val = redis.opsForValue().get(key);
        return (val == null) ? 0L : Long.parseLong(val);
    }

    /** 댓글 목록 조회 */
    @Transactional(readOnly = true)
    public List<CommunityCommentResponse> getCommentsByPost(Long postId, Integer currentUserId) {

        communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        List<CommunityCommentEntity> entities =
                communityCommentRepository.findCommentsOrdered(postId);

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

    /** 모든 댓글 조회 (관리자용) */
    @Transactional(readOnly = true)
    public List<CommunityCommentResponse> getAllComments(Integer currentUserId) {
        List<CommunityCommentEntity> entities = communityCommentRepository.findAll();
        
        // 최신순 정렬
        entities.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        List<CommunityCommentResponse> responses = new ArrayList<>();
        for (CommunityCommentEntity entity : entities) {
            responses.add(toResponse(entity, currentUserId));
        }
        
        return responses;
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

        // 게시글 댓글 count 증가
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
        return toResponse(comment, userId);
    }

    /** 댓글 삭제 */
    public void deleteComment(Long commentId, Integer userId, UserEntity currentUser) {

        CommunityCommentEntity comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        // 🔥 관리자(ADMIN, SUPER_ADMIN)는 작성자가 아니어도 삭제 가능
        boolean isAdmin = currentUser.getRole() == UserEntity.Role.ADMIN 
                || currentUser.getRole() == UserEntity.Role.SUPER_ADMIN;
        
        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        communityCommentRepository.delete(comment);

        // Redis clean
        communityCommentReactionService.clearCommentReaction(commentId);
    }

    /** DTO 변환 */
    private CommunityCommentResponse toResponse(CommunityCommentEntity entity, Integer currentUserId) {

        Long id = entity.getCommentId();

        boolean mine = (currentUserId != null) &&
                entity.getUser().getId().equals(currentUserId);

        long likeCount = getCount("community:comment:" + id + ":like:count");
        long dislikeCount = getCount("community:comment:" + id + ":dislike:count");

        boolean likedByMe = false;
        boolean dislikedByMe = false;

        if (currentUserId != null) {
            likedByMe = Boolean.TRUE.equals(redis.opsForSet()
                    .isMember("community:comment:" + id + ":like:users", currentUserId.toString()));

            dislikedByMe = Boolean.TRUE.equals(redis.opsForSet()
                    .isMember("community:comment:" + id + ":dislike:users", currentUserId.toString()));
        }

        return CommunityCommentResponse.builder()
                .commentId(id)
                .postId(entity.getPost().getPostId())
                .parentCommentId(entity.getParent() != null ? entity.getParent().getCommentId() : null)
                .userId(entity.getUser().getId())
                .nickname(entity.getUser().getNickname())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .mine(mine)
                .likedByMe(likedByMe)
                .dislikedByMe(dislikedByMe)
                .replies(new ArrayList<>())
                .avatarIcon(entity.getUser().getAvatarIcon())      // dto에 맞게 추가함
                .profileFrame(entity.getUser().getProfileFrame())  // dto에 맞게 추가함
                .profileBadge(entity.getUser().getProfileBadge())  // dto에 맞게 추가함 
                .build();
    }
}
