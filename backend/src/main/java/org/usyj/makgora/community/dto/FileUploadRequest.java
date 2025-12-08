package org.usyj.makgora.community.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * 커뮤니티 게시글 파일 업로드 요청 DTO
 * - 단일 파일 또는 여러 파일 업로드 지원
 * - 파일과 함께 추가 메타데이터 전송 가능
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadRequest {

    /**
     * 업로드할 파일
     * - 단일 파일: MultipartFile 사용
     * - 여러 파일: List<MultipartFile> 사용 (향후 확장 가능)
     */
    @NotNull(message = "업로드할 파일은 필수입니다")
    private MultipartFile file;

    /**
     * 파일 설명 (선택사항)
     * - 이미지/동영상에 대한 추가 설명
     */
    private String description;

    /**
     * 파일 순서 (선택사항)
     * - 여러 파일 업로드 시 순서 지정
     */
    private Integer order;
}
