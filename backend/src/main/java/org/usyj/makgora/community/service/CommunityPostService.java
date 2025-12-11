package org.usyj.makgora.community.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.dto.CommunityPostCreateRequest;
import org.usyj.makgora.community.dto.CommunityPostResponse;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.UserEntity;
import org.springframework.data.redis.core.StringRedisTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostService {

    private final CommunityPostRepository communityPostRepository;
    private final CommunityPostReactionService postReactionService;
    private final StringRedisTemplate redis;

    /** 게시글 등록 */
    @Transactional
    public CommunityPostResponse createPost(
            CommunityPostCreateRequest request, UserEntity user) {

        CommunityPostEntity post = CommunityPostEntity.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .postType(request.getPostType() == null ? "일반" : request.getPostType())
                .build();

        communityPostRepository.save(post);

        Long postId = post.getPostId();

        // 🔥 Redis 초기값 세팅 (안정성)
        redis.opsForValue().set("cp:" + postId + ":view", "0");
        redis.opsForValue().set("cp:" + postId + ":comment", "0");
        redis.opsForValue().set("cp:" + postId + ":like", "0");
        redis.opsForValue().set("cp:" + postId + ":dislike", "0");

        return CommunityPostResponse.fromEntityWithCounts(
                post,
                0,
                0,
                0,
                0
        );
    }

    /** 전체 게시글 조회 */
    @Transactional(readOnly = true)
    public List<CommunityPostResponse> getAllPosts() {

        List<CommunityPostEntity> entities = communityPostRepository.findAllByOrderByCreatedAtDesc();

        return entities.stream()
                .map(entity -> {
                    Long postId = entity.getPostId();

                    long viewCount = postReactionService.getViewCount(postId);
                    long commentCount = postReactionService.getCommentCount(postId);
                    long likeCount = postReactionService.getLikeCount(postId);
                    long dislikeCount = postReactionService.getDislikeCount(postId);

                    return CommunityPostResponse.fromEntityWithCounts(
                            entity,
                            viewCount,
                            commentCount,
                            likeCount,
                            dislikeCount
                    );
                })
                .collect(Collectors.toList());
    }

    /** 단건 조회 */
    @Transactional(readOnly = true)
    public CommunityPostResponse getPostById(Long postId) {
        CommunityPostEntity post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));

        return CommunityPostResponse.fromEntityWithCounts(
                post,
                postReactionService.getViewCount(postId),
                postReactionService.getCommentCount(postId),
                postReactionService.getLikeCount(postId),
                postReactionService.getDislikeCount(postId)
        );
    }

    /** 게시글 수정 */
    @Transactional
    public CommunityPostResponse updatePost(
            Long postId,
            CommunityPostCreateRequest request,
            UserEntity currentUser
    ) {
        CommunityPostEntity post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));

        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("작성자만 게시글을 수정할 수 있습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setPostType(request.getPostType() == null ? "일반" : request.getPostType());

        return CommunityPostResponse.fromEntityWithCounts(
                post,
                postReactionService.getViewCount(postId),
                postReactionService.getCommentCount(postId),
                postReactionService.getLikeCount(postId),
                postReactionService.getDislikeCount(postId)
        );
    }

    /** 게시글 삭제 */
    @Transactional
    public void deletePost(Long postId, UserEntity currentUser) {
        CommunityPostEntity post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));

        // 🔥 관리자(ADMIN, SUPER_ADMIN)는 작성자가 아니어도 삭제 가능
        boolean isAdmin = currentUser.getRole() == UserEntity.Role.ADMIN 
                || currentUser.getRole() == UserEntity.Role.SUPER_ADMIN;
        
        if (!isAdmin && !post.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("작성자만 게시글을 삭제할 수 있습니다.");
        }

        // Redis 데이터 삭제
        redis.delete("cp:" + postId + ":view");
        redis.delete("cp:" + postId + ":comment");
        redis.delete("cp:" + postId + ":like");
        redis.delete("cp:" + postId + ":dislike");
        redis.delete("cp:" + postId + ":score");
        redis.delete("cp:" + postId + ":triggered");

        // 🔥 게시글 반응(reactions) 먼저 삭제 (외래키 제약 조건 해결)
        postReactionService.deleteAllReactionsByPostId(postId);

        // DB에서 게시글 삭제 (댓글과 파일은 CASCADE로 자동 삭제됨)
        communityPostRepository.delete(post);
    }
}
