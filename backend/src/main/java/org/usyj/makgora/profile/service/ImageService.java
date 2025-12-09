package org.usyj.makgora.profile.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

    // ===========================
    // 🔥 1) 공통 업로드
    // ===========================
    public String uploadImage(MultipartFile file, String folder) throws IOException {

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image",
                        "overwrite", true
                )
        );

        return uploadResult.get("secure_url").toString();
    }

    // ===========================
    // 🔥 2) Cloudinary 이미지 삭제
    // ===========================
    public void deleteImage(String imageUrl) {

        if (imageUrl == null || !imageUrl.contains("cloudinary")) return;

        try {
            String publicId = extractPublicId(imageUrl);

            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));

        } catch (Exception e) {
            System.out.println("Cloudinary 삭제 실패: " + imageUrl);
        }
    }

    // ===========================
    // 🔧 URL → PublicId 추출
    // ===========================
    private String extractPublicId(String url) {

        // ex) https://res.cloudinary.com/.../profile/12/abc123.png
        String[] parts = url.split("/");
        String last = parts[parts.length - 1]; // 파일명
        String folder = parts[parts.length - 2]; // 상위 폴더 (profile, frame 등)

        return folder + "/" + last.substring(0, last.lastIndexOf("."));  // 확장자 제거
    }
}
