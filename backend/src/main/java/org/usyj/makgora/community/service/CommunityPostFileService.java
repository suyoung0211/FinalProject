package org.usyj.makgora.community.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.community.dto.FileUploadResponse;
import org.usyj.makgora.community.repository.CommunityPostFileRepository;
import org.usyj.makgora.community.repository.CommunityPostRepository;
import org.usyj.makgora.entity.CommunityPostEntity;
import org.usyj.makgora.entity.CommunityPostFileEntity;
import org.usyj.makgora.entity.UserEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityPostFileService {

    private final CommunityPostFileRepository fileRepository;
    private final CommunityPostRepository postRepository;

    // 허용된 이미지 확장자
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "webp");
    // 허용된 동영상 확장자
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of("mp4", "webm", "mov");
    // 최대 파일 크기 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * 파일 업로드
     */
    public FileUploadResponse uploadFile(Long postId, MultipartFile file, UserEntity user) throws IOException {
        // 1) 게시글 존재 확인 및 권한 확인
        CommunityPostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("작성자만 파일을 업로드할 수 있습니다.");
        }

        // 2) 파일 유효성 검증
        validateFile(file);

        // 3) 파일 타입 판별
        CommunityPostFileEntity.FileType fileType = determineFileType(file.getOriginalFilename());

        // 4) 저장 디렉토리 생성
        String uploadDir = "uploads/community/" + (fileType == CommunityPostFileEntity.FileType.IMAGE ? "images" : "videos") + "/";
        Files.createDirectories(Paths.get(uploadDir));

        // 5) 파일명 생성 (중복 방지)
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = "post_" + postId + "_" + System.currentTimeMillis() + "_" + sanitizeFilename(originalFilename);
        Path filePath = Paths.get(uploadDir + filename);

        // 6) 파일 저장
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 7) DB에 파일 정보 저장
        String relativePath = uploadDir + filename;
        CommunityPostFileEntity fileEntity = CommunityPostFileEntity.builder()
                .post(post)
                .fileType(fileType)
                .filePath(relativePath)
                .fileName(originalFilename)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();

        fileRepository.save(fileEntity);

        // 8) 응답 생성
        return FileUploadResponse.builder()
                .fileId(fileEntity.getFileId())
                .postId(postId)
                .fileType(fileType.name())
                .fileUrl("/" + relativePath)  // 프론트엔드에서 접근할 URL
                .fileName(originalFilename)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .createdAt(fileEntity.getCreatedAt())
                .build();
    }

    /**
     * 게시글의 모든 첨부파일 조회
     */
    @Transactional(readOnly = true)
    public List<FileUploadResponse> getFilesByPostId(Long postId) {
        List<CommunityPostFileEntity> files = fileRepository.findByPost_PostIdOrderByCreatedAtAsc(postId);
        
        return files.stream()
                .map(file -> FileUploadResponse.builder()
                        .fileId(file.getFileId())
                        .postId(file.getPost().getPostId())
                        .fileType(file.getFileType().name())
                        .fileUrl("/" + file.getFilePath())
                        .fileName(file.getFileName())
                        .fileSize(file.getFileSize())
                        .mimeType(file.getMimeType())
                        .createdAt(file.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(Long fileId, UserEntity user) throws IOException {
        CommunityPostFileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. id=" + fileId));

        // 권한 확인
        if (!file.getPost().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("작성자만 파일을 삭제할 수 있습니다.");
        }

        // 파일 시스템에서 삭제
        Path filePath = Paths.get(file.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // DB에서 삭제
        fileRepository.delete(file);
    }

    // ==========================================
    // 🔹 Private Helper Methods
    // ==========================================

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 50MB를 초과할 수 없습니다.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("파일명이 없습니다.");
        }

        String extension = getFileExtension(filename).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension) && !ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다. 이미지: jpg, jpeg, png, gif, webp / 동영상: mp4, webm, mov");
        }
    }

    private CommunityPostFileEntity.FileType determineFileType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        if (ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            return CommunityPostFileEntity.FileType.IMAGE;
        } else if (ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            return CommunityPostFileEntity.FileType.VIDEO;
        } else {
            throw new IllegalArgumentException("지원하지 않는 파일 형식입니다.");
        }
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }

    private String sanitizeFilename(String filename) {
        // 경로 탐색 공격 방지 및 특수문자 제거
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}