package org.usyj.makgora.profile.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    // ============================================================
    // 🔥 1) 공통 이미지 업로드 (기본: image 리소스)
    // ============================================================
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "overwrite", true
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("이미지 업로드 실패", e);
        }
    }

    // ============================================================
    // 🔥 2) 이미지 / 동영상 업로드 (커뮤니티 용)
    // ============================================================
    public String uploadMedia(MultipartFile file, String folder, boolean isVideo) throws IOException {

        String resourceType = isVideo ? "video" : "image";

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", resourceType,
                        "overwrite", true
                )
        );

        return uploadResult.get("secure_url").toString();
    }

    // ============================================================
    // 🔥 3) 공통 삭제 (이미지/동영상 모두 삭제 가능)
    // ============================================================
    public void deleteMedia(String url, boolean isVideo) {

        if (url == null || !url.contains("cloudinary")) return;

        try {
            String publicId = extractPublicId(url);

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "invalidate", true,
                            "resource_type", isVideo ? "video" : "image"
                    )
            );

        } catch (Exception e) {
            System.out.println("Cloudinary 삭제 실패: " + url);
        }
    }

    // ============================================================
    // 🔥 4) 이미지 전용 삭제
    // ============================================================
    public void deleteImage(String imageUrl) {

        if (imageUrl == null || !imageUrl.contains("cloudinary")) return;

        try {
            String publicId = extractPublicId(imageUrl);

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("invalidate", true)
            );

        } catch (Exception e) {
            System.out.println("Cloudinary 이미지 삭제 실패: " + imageUrl);
        }
    }

    // ============================================================
    // 🔧 5) URL → Public ID 추출 (폴더 포함)
    // ============================================================
    private String extractPublicId(String url) {

        // 예: https://res.cloudinary.com/.../profile/12/abc123.png
        String[] parts = url.split("/");

        // 마지막: 파일명 + 확장자
        String fileName = parts[parts.length - 1];

        // 확장자 제거
        String fileWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

        // 상위 폴더 이름
        String folderName = parts[parts.length - 2];

        // profile/abc123 형태로 반환
        return folderName + "/" + fileWithoutExt;
    }
}
