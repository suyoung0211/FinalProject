package org.usyj.makgora.community.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.community.dto.CommunityPostCreateRequest;
import org.usyj.makgora.community.dto.CommunityPostResponse;
import org.usyj.makgora.community.service.CommunityPostService;
import org.usyj.makgora.security.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityPostController {

    private final CommunityPostService communityPostService;

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
        CommunityPostResponse post = communityPostService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    // 게시글 작성
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
}
