package org.usyj.makgora.community.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.community.dto.FileUploadResponse;
import org.usyj.makgora.community.service.CommunityPostFileService;
import org.usyj.makgora.global.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityPostFileController {

    private final CommunityPostFileService fileService;

    /**
     * 파일 업로드
     * POST /api/community/posts/{postId}/files
     */
    @PostMapping("/{postId}/files")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @PathVariable Long postId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            FileUploadResponse response = fileService.uploadFile(
                    postId,
                    file,
                    userDetails.getUser()
            );
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 게시글의 모든 첨부파일 조회
     * GET /api/community/posts/{postId}/files
     */
    @GetMapping("/{postId}/files")
    public ResponseEntity<List<FileUploadResponse>> getFiles(@PathVariable Long postId) {
        List<FileUploadResponse> files = fileService.getFilesByPostId(postId);
        return ResponseEntity.ok(files);
    }

    /**
     * 파일 삭제
     * DELETE /api/community/posts/{postId}/files/{fileId}
     */
    @DeleteMapping("/{postId}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long postId,
            @PathVariable Long fileId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            fileService.deleteFile(fileId, userDetails.getUser());
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}