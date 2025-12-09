package org.usyj.makgora.community.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
import org.usyj.makgora.profile.service.ImageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityPostFileService {

    private final CommunityPostFileRepository fileRepository;
    private final CommunityPostRepository postRepository;
    private final ImageService imageService;   // ✅ Cloudinary 공통 서비스

    @Value("${spring.profiles.active:dev}")   // 설정 없으면 기본 dev
    private String activeProfile;

    // 허용된 이미지 확장자
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS =
            List.of("jpg", "jpeg", "png", "gif", "webp");
    // 허용된 동영상 확장자
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS =
            List.of("mp4", "webm", "mov");
    // 최대 파일 크기 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * 파일 업로드
     * - dev  : 로컬 uploads/ 에 저장
     * - prod : Cloudinary에 저장
     */
    public FileUploadResponse uploadFile(Long postId,
                                         MultipartFile file,
                                         UserEntity user) throws IOException {

        // 1) 게시글 존재 확인 및 권한 확인
        CommunityPostEntity post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new IllegalArgumentException("게시글을 찾을 수 없습니다. id=" + postId));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("작성자만 파일을 업로드할 수 있습니다.");
        }

        // 2) 파일 유효성 검증
        validateFile(file);

        // 3) 파일 타입 판별 (IMAGE / VIDEO)
        CommunityPostFileEntity.FileType fileType =
                determineFileType(file.getOriginalFilename());

        String storedPath;   // DB에 저장할 값
        String fileUrl;      // 프론트로 내려줄 URL

        if ("prod".equals(activeProfile)) {
            // ========================
            // 🔥 배포 환경: Cloudinary
            // ========================
            boolean isVideo = (fileType == CommunityPostFileEntity.FileType.VIDEO);
            String folder = "community/" + postId;     // 게시글별 폴더

            String url = imageService.uploadMedia(file, folder, isVideo);
            storedPath = url;     // DB에는 Cloudinary URL 그대로 저장
            fileUrl = url;        // 프론트도 Cloudinary URL 그대로 사용
        } else {
            // ========================
            // 💻 개발 환경: 로컬 저장
            // ========================
            String subDir = (fileType == CommunityPostFileEntity.FileType.IMAGE)
                    ? "images" : "videos";

            String uploadDir = "uploads/community/" + subDir + "/";
            Files.createDirectories(Paths.get(uploadDir));

            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = "post_" + postId + "_" + System.currentTimeMillis() + "_" + sanitizeFilename(originalFilename);
            storedPath = uploadDir + filename;              // 예: uploads/community/images/post_...png

            Path filePath = Paths.get(storedPath);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            fileUrl = "/" + storedPath;                    // 프론트에서 접근할 URL (/uploads/...)
        }

        // 4) DB에 파일 정보 저장
        CommunityPostFileEntity fileEntity = CommunityPostFileEntity.builder()
                .post(post)
                .fileType(fileType)
                .filePath(storedPath)        // dev: 상대경로, prod: Cloudinary URL
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();

        fileRepository.save(fileEntity);

        // 5) 응답
        return FileUploadResponse.builder()
                .fileId(fileEntity.getFileId())
                .postId(postId)
                .fileType(fileType.name())
                .fileUrl(fileUrl)           // dev: /uploads/..., prod: Cloudinary URL
                .fileName(file.getOriginalFilename())
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

        List<CommunityPostFileEntity> files =
                fileRepository.findByPost_PostIdOrderByCreatedAtAsc(postId);

        return files.stream()
                .map(file -> {
                    String path = file.getFilePath();
                    // prod: Cloudinary URL (http로 시작)
                    // dev : uploads/로 시작하는 상대 경로 → 앞에 "/" 붙여서 /uploads/...
                    String url = path.startsWith("http")
                            ? path
                            : "/" + path;

                    return FileUploadResponse.builder()
                            .fileId(file.getFileId())
                            .postId(file.getPost().getPostId())
                            .fileType(file.getFileType().name())
                            .fileUrl(url)
                            .fileName(file.getFileName())
                            .fileSize(file.getFileSize())
                            .mimeType(file.getMimeType())
                            .createdAt(file.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 파일 삭제
     * - dev  : 로컬 파일 삭제
     * - prod : Cloudinary에서 삭제
     */
    public void deleteFile(Long fileId, UserEntity user) throws IOException {

        CommunityPostFileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() ->
                        new IllegalArgumentException("파일을 찾을 수 없습니다. id=" + fileId));

        // 권한 확인
        if (!file.getPost().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("작성자만 파일을 삭제할 수 있습니다.");
        }

        if ("prod".equals(activeProfile)) {
            // 🔥 배포: Cloudinary에서 삭제
            boolean isVideo = (file.getFileType() == CommunityPostFileEntity.FileType.VIDEO);
            imageService.deleteMedia(file.getFilePath(), isVideo);
        } else {
            // 💻 개발: 로컬 파일 삭제
            Path filePath = Paths.get(file.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
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
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)
                && !ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException(
                    "지원하지 않는 파일 형식입니다. " +
                            "이미지: jpg, jpeg, png, gif, webp / " +
                            "동영상: mp4, webm, mov"
            );
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
