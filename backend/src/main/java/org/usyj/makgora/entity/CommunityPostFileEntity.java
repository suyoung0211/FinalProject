package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_post_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityPostFileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long fileId;

    /** 게시글 정보 (FK: community_posts.post_id) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPostEntity post;

    /** 파일 타입 (IMAGE, VIDEO) */
    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 20)
    private FileType fileType;

    /** 파일 저장 경로 */
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    /** 원본 파일명 */
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    /** 파일 크기 (bytes) */
    @Column(name = "file_size")
    private Long fileSize;

    /** MIME 타입 (예: image/jpeg, video/mp4) */
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    /** 업로드 시각 */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum FileType {
        IMAGE, VIDEO
    }
}