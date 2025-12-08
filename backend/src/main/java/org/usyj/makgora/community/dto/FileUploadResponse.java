package org.usyj.makgora.community.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class FileUploadResponse {
    private Long fileId;
    private Long postId;
    private String fileType;  // "IMAGE" or "VIDEO"
    private String fileUrl;   // 접근 가능한 URL (예: "/uploads/community/images/...")
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime createdAt;
}