package org.usyj.makgora.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String upload(MultipartFile file) {
        try {
            File temp = File.createTempFile("upload", file.getOriginalFilename());
            file.transferTo(temp);

            Map uploadResult = cloudinary.uploader().upload(temp, ObjectUtils.emptyMap());

            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Cloudinary 업로드 실패");
        }
    }
}