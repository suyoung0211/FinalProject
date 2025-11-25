package org.usyj.makgora.community.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.community.dto.CommunityPostCreateRequest;
import org.usyj.makgora.community.dto.CommunityPostResponse;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.CommunityPostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostService {

    private final CommunityPostRepository communityPostRepository;

    /** 게시글 등록 */
    public CommunityPostResponse createPost(
            CommunityPostCreateRequest request, UserEntity user) {
        try {
            System.out.println("💾 게시글 저장 시작...");
            
            CommunityPostEntity post = CommunityPostEntity.builder()
                    .user(user)
                    .title(request.getTitle())
                    .content(request.getContent())
                    .postType(request.getPostType() == null ? "일반" : request.getPostType())
                    .build();

            System.out.println("   - Entity 생성 완료 (postId: 아직 없음)");
            
            // DB 저장
            communityPostRepository.save(post);
            
            System.out.println("   - DB 저장 완료! 생성된 postId: " + post.getPostId());
            System.out.println("   - 추천 수: " + post.getRecommendationCount());
            System.out.println("   - 작성 시간: " + post.getCreatedAt());

            return CommunityPostResponse.builder()
                    .postId(post.getPostId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .postType(post.getPostType())
                    .author(user.getNickname())
                    .createdAt(post.getCreatedAt())
                    .build();

        } catch (Exception e) {
            System.out.println("❌ 게시글 저장 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("게시글 작성 실패: " + e.getMessage());
        }
    }

    // ⭐ 전체 게시글 조회 (최신순)
    @Transactional(readOnly = true)
    public List<CommunityPostResponse> getAllPosts() {
        return communityPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CommunityPostResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
