package org.usyj.makgora.profile.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.entity.StoreItemEntity;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.entity.UserStoreEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.repository.UserStoreRepository;
import org.usyj.makgora.response.UserInfoResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final UserStoreRepository userStoreRepository;

    // ================================================
    // 1) 내 프로필 정보 반환
    // ================================================
    @Transactional(readOnly = true)
    public UserInfoResponse getMyProfile(Integer userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return new UserInfoResponse(
                user.getNickname(),
                user.getLevel(),
                user.getPoints(),
                user.getAvatarIcon(),
                user.getProfileFrame(),
                user.getProfileBadge(),
                user.getRole().name()
        );
    }

    // ================================================
    // 2) 프로필 사진 업로드
    // ================================================
    public String uploadProfileImage(Integer userId, MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new RuntimeException("업로드할 파일이 없습니다.");
        }

        String uploadDir = "uploads/profile/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + filename);

        Files.copy(file.getInputStream(), filePath);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        String imageUrl = "/uploads/profile/" + filename;
        user.setAvatarIcon(imageUrl);

        return imageUrl;
    }

    // ================================================
    // 3) 프레임 or 뱃지 적용
    // ================================================
    public String applyItem(Integer userId, Long userStoreId) {

        UserStoreEntity ownedItem = userStoreRepository.findById(userStoreId)
                .orElseThrow(() -> new RuntimeException("구매한 아이템 없음"));

        if (!ownedItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 소유의 아이템만 적용 가능합니다.");
        }

        StoreItemEntity item = ownedItem.getItem();
        UserEntity user = ownedItem.getUser();

        switch (item.getCategory()) {
            case FRAME -> {
                user.setProfileFrame(item.getImage());
                return "프로필 테두리가 적용되었습니다.";
            }
            case BADGE -> {
                user.setProfileBadge(item.getImage());
                return "프로필 뱃지가 적용되었습니다.";
            }
            default -> throw new RuntimeException("지원하지 않는 카테고리입니다.");
        }
    }
}
