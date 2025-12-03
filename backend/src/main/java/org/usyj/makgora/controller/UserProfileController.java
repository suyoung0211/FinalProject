package org.usyj.makgora.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.response.UserInfoResponse;
import org.usyj.makgora.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 프로필 이미지 업로드
    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserInfoResponse uploadProfilePhoto(
            HttpServletRequest request,
            @RequestPart("file") MultipartFile file
    ) throws IOException {

        String token = request.getHeader("Authorization").substring(7);
        Integer userId = jwtTokenProvider.getUserId(token);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        // 로컬 저장 테스트 (운영에서는 S3 추천)
        String fileName = "profile_" + userId + "_" + System.currentTimeMillis() + ".png";
        String filePath = "uploads/" + fileName;
        Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

        // DB 업데이트
        user.setAvatarIcon(filePath);
        userRepository.save(user);

        return UserInfoResponse.builder()
        .nickname(user.getNickname())
        .level(user.getLevel())
        .points(user.getPoints())
        .avatarIcon(user.getAvatarIcon())
        .profileFrame(user.getProfileFrame())
        .profileBadge(user.getProfileBadge())
        .role(user.getRole().name())
        .build();
    }
}