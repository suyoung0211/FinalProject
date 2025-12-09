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

    public String uploadImage(MultipartFile file, String folder) {
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
