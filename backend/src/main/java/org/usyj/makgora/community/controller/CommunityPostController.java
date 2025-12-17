package org.usyj.makgora.community.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.community.dto.request.CommunityPostCreateRequest;
import org.usyj.makgora.community.dto.request.CommunityPostReactionRequest;
import org.usyj.makgora.community.dto.request.CommunityPostResponse;
import org.usyj.makgora.community.dto.response.CommunityPostReactionResponse;
import org.usyj.makgora.community.service.CommunityPostReactionService;
import org.usyj.makgora.community.service.CommunityPostService;
import org.usyj.makgora.global.security.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;
    private final CommunityPostReactionService communityPostReactionService;
    

    // ⭐ GET /api/community/posts – 전체 목록 조회
    @GetMapping
    public ResponseEntity<List<CommunityPostResponse>> getPosts() {
        System.out.println("📋 게시글 목록 조회 요청");
        List<CommunityPostResponse> posts = communityPostService.getAllPosts();
        System.out.println("   - 조회된 게시글 수: " + posts.size());
        return ResponseEntity.ok(posts);
    }

    // ⭐ 단일 게시글 조회
    @GetMapping("/{postId}")
    public ResponseEntity<CommunityPostResponse> getPost(@PathVariable Long postId) {
        System.out.println("📄 게시글 단건 조회 요청, id = " + postId);
        // ⭐ 조회수 증가
        communityPostReactionService.addView(postId);
        CommunityPostResponse post = communityPostService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    // ⭐ 게시글 작성
    @PostMapping
    public CommunityPostResponse createPost(
            @Valid @RequestBody CommunityPostCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        System.out.println("📝 게시글 작성 요청 도착");
        System.out.println("   - 작성자: " + userDetails.getUser().getNickname() + " (ID: " + userDetails.getUser().getId() + ")");
        System.out.println("   - 제목: " + request.getTitle());
        System.out.println("   - 내용 길이: " + (request.getContent() != null ? request.getContent().length() : 0) + "자");
        System.out.println("   - 게시글 유형: " + request.getPostType());

        CommunityPostResponse response = communityPostService.createPost(request, userDetails.getUser());

        System.out.println("✅ 게시글 작성 완료!");
        System.out.println("   - 게시글 ID: " + response.getPostId());
        System.out.println("   - 작성일: " + response.getCreatedAt());

        return response;
    }

    // ⭐ 게시글 수정 (작성자만)
    @PutMapping("/{postId}")
    public CommunityPostResponse updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody CommunityPostCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        System.out.println("✏️ 게시글 수정 요청 도착, id = " + postId);
        System.out.println("   - 요청자: " + userDetails.getUser().getNickname()
                + " (ID: " + userDetails.getUser().getId() + ")");
        System.out.println("   - 수정 제목: " + request.getTitle());
        System.out.println("   - 수정 postType: " + request.getPostType());

        CommunityPostResponse response =
                communityPostService.updatePost(postId, request, userDetails.getUser());

        System.out.println("✅ 게시글 수정 완료, id = " + response.getPostId());
        return response;
    }

    // ⭐ 게시글 추천/비추천 반응
    @PostMapping("/{postId}/reactions")
    public ResponseEntity<CommunityPostReactionResponse> reactToPost(
            @PathVariable Long postId,
            @Valid @RequestBody CommunityPostReactionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        System.out.println("👍/👎 게시글 반응 요청 도착, postId = " + postId);
        System.out.println("   - 요청자: " + userDetails.getUser().getNickname()
                + " (ID: " + userDetails.getUser().getId() + ")");
        System.out.println("   - 요청 반응 값: " + request.getReactionValue());

        CommunityPostReactionResponse response =
                communityPostReactionService.reactToPost(
                        postId,
                        userDetails.getUser(),
                        request.getReactionValue()
                );

        System.out.println("✅ 게시글 반응 처리 완료");
        System.out.println("   - 현재 추천 수: " + response.getRecommendationCount());
        System.out.println("   - 현재 비추천 수: " + response.getDislikeCount());
        System.out.println("   - 내 반응 상태: " + response.getMyReaction());

        return ResponseEntity.ok(response);
    }

    // ⭐ 게시글 삭제 (작성자만)
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        System.out.println("🗑️ 게시글 삭제 요청 도착, id = " + postId);
        System.out.println("   - 요청자: " + userDetails.getUser().getNickname()
                + " (ID: " + userDetails.getUser().getId() + ")");

        try {
            communityPostService.deletePost(postId, userDetails.getUser());
            System.out.println("✅ 게시글 삭제 완료, id = " + postId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            System.out.println("❌ 게시글 삭제 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            System.out.println("❌ 게시글 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("게시글 삭제에 실패했습니다."));
        }
    }

    // 에러 응답용 내부 클래스
    private static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
}
