package org.usyj.makgora.profile.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final Cloudinary cloudinary;

<<<<<<< HEAD
    public String uploadImage(MultipartFile file, String folder) {
=======
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

    // 🔥 커뮤니티용: 이미지/동영상 구분 업로드
    public String uploadMedia(MultipartFile file, String folder, boolean isVideo) throws IOException {

        // 1) Cloudinary에 넘길 resource_type 결정
        String resourceType = isVideo ? "video" : "image";

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", resourceType,   // 🔥 여기서 image / video 확실히 구분
                        "overwrite", true
                )
        );

        return uploadResult.get("secure_url").toString();
    }

    // ===========================
    // 🔥 2) 공통 삭제: 이미지/동영상 둘 다
    // ===========================
    public void deleteMedia(String url, boolean isVideo) {

        if (url == null || !url.contains("cloudinary")) return;

        try {
            String publicId = extractPublicId(url);

            String resourceType = isVideo ? "video" : "image";

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "invalidate", true,
                            "resource_type", resourceType   // ⭐ 핵심: image / video 구분
                    )
            );

        } catch (Exception e) {
            System.out.println("Cloudinary 삭제 실패: " + url);
        }
    }

    // ===========================
    // 🔥 2) Cloudinary 이미지 삭제
    // ===========================
    public void deleteImage(String imageUrl) {

        if (imageUrl == null || !imageUrl.contains("cloudinary")) return;

>>>>>>> 84cd89c1802b9ed06e03ac297bca134abccc1e82
        try {
            var result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "overwrite", true,
                            "resource_type", "image"
                    )
            );

            return result.get("secure_url").toString();

        } catch (Exception e) {
            throw new RuntimeException("이미지 업로드 실패", e);
        }
    }

    public void deleteImage(String url) {
        try {
            if (url == null) return;

            // URL에서 public_id 추출
            String publicId = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        } catch (Exception e) {
            throw new RuntimeException("이미지 삭제 실패", e);
        }
    }
}
