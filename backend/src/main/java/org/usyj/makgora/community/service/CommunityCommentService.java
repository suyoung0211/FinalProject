package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;
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
    private final UserRepository userRepository;

    /**
     * 특정 게시글의 댓글/대댓글 목록 조회
     * - DB에서 평탄하게 가져온 후
     * - parent(부모 댓글) 기준으로 트리 구조로 조립
     */
    @Transactional(readOnly = true)
    public List<CommunityCommentResponse> getCommentsByPost(Long postId, Integer currentUserId) {
        // 1) 게시글 존재 여부 체크
        communityPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        // 2) 해당 게시글의 모든 댓글/대댓글 가져오기 (작성 시간 순)
        List<CommunityCommentEntity> entities =
                communityCommentRepository.findByPost_PostIdOrderByCreatedAtAsc(postId);

        // 3) Entity -> DTO 1차 변환 + Map에 저장
        Map<Long, CommunityCommentResponse> dtoMap = new LinkedHashMap<>();
        for (CommunityCommentEntity entity : entities) {
            CommunityCommentResponse dto = toResponse(entity, currentUserId);
            // toResponse에서 replies를 new ArrayList<>()로 넣어주고 있으니 setReplies는 필요 없음
            dtoMap.put(dto.getCommentId(), dto);
        }

        // 4) parent 기준으로 트리 구성
        List<CommunityCommentResponse> roots = new ArrayList<>();

        for (CommunityCommentEntity entity : entities) {
            Long commentId = entity.getCommentId();
            Long parentId = (entity.getParent() != null)
                    ? entity.getParent().getCommentId()
                    : null;

            CommunityCommentResponse current = dtoMap.get(commentId);

            if (parentId == null) {
                // 루트 댓글
                roots.add(current);
            } else {
                // 대댓글 → 부모 아래에 추가
                CommunityCommentResponse parent = dtoMap.get(parentId);
                if (parent != null) {
                    parent.getReplies().add(current);
                } else {
                    // (이상 케이스) 부모를 못 찾으면 그냥 루트에라도 붙여둠
                    roots.add(current);
                }
            }
        }

        return roots;
    }


    /**
     * 댓글/대댓글 작성
     */
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

        CommunityCommentEntity entity = CommunityCommentEntity.builder()
                .post(post)
                .user(user)
                .parent(parent)
                .content(request.getContent())
                .build();

        CommunityCommentEntity saved = communityCommentRepository.save(entity);
        return toResponse(saved, userId);
    }

    /**
     * 댓글 수정 (본인만 가능)
     */
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
        // @PreUpdate 덕분에 updatedAt은 자동 갱신

        CommunityCommentEntity updated = communityCommentRepository.save(comment);
        return toResponse(updated, userId);
    }

    /**
     * 댓글 삭제 (본인만 가능)
     */
    public void deleteComment(Long commentId, Integer userId) {
        CommunityCommentEntity comment = communityCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        communityCommentRepository.delete(comment);
    }

    /**
     * Entity -> DTO 변환 메서드
     * (추천/비추천 필드는 엔티티에 없으니 일단 0으로 채워둔 상태)
     */
    private CommunityCommentResponse toResponse(CommunityCommentEntity entity, Integer currentUserId) {
        boolean mine = (currentUserId != null)
                && entity.getUser().getId().equals(currentUserId);

        return CommunityCommentResponse.builder()
                .commentId(entity.getCommentId())
                .postId(entity.getPost().getPostId())
                .parentCommentId(
                        entity.getParent() != null
                                ? entity.getParent().getCommentId()
                                : null
                )
                .userId(entity.getUser().getId())
                .nickname(entity.getUser().getNickname())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .likeCount(0)      // 엔티티에 없어서 임시 0
                .dislikeCount(0)   // 엔티티에 없어서 임시 0
                .mine(mine)
                .replies(new ArrayList<>())
                .build();
    }
}
