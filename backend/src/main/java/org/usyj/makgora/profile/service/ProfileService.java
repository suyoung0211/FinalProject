package org.usyj.makgora.profile.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.store.dto.response.MyItemResponse;
import org.usyj.makgora.store.entity.StoreItemEntity;
import org.usyj.makgora.store.entity.UserStoreEntity;
import org.usyj.makgora.store.repository.UserStoreRepository;
import org.usyj.makgora.user.dto.request.UserUpdateRequest;
import org.usyj.makgora.user.dto.response.UserInfoResponse;
import org.usyj.makgora.user.entity.UserEntity;
import org.usyj.makgora.user.repository.UserRepository;
import org.usyj.makgora.profile.service.ImageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final UserRepository userRepository;
    private final UserStoreRepository userStoreRepository;
    private final Cloudinary cloudinary;   // 🔥 Cloudinary 주입 필수!!
    private final ImageService imageService;

    @Transactional(readOnly = true)
    public UserInfoResponse getMyProfile(Integer userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return UserInfoResponse.builder()
                .loginId(user.getLoginId())
                .nickname(user.getNickname())
                .level(user.getLevel())
                .points(user.getPoints())
                .avatarIcon(user.getAvatarIcon())
                .profileFrame(user.getProfileFrame())
                .profileBadge(user.getProfileBadge())
                .role(user.getRole().name())
                .build();
    }

    // 🔥 Cloudinary 업로드 버전
    public String uploadProfileImage(Integer userId, MultipartFile file) throws IOException {

    UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("유저 없음"));

    // 기존 Cloudinary 이미지 삭제
    imageService.deleteImage(user.getAvatarIcon());

    // 새 이미지 업로드
    String url = imageService.uploadImage(file, "profile/" + userId);

    user.setAvatarIcon(url);
    return url;
}


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

    @Transactional(readOnly = true)
    public List<MyItemResponse> getMyItems(Integer userId) {

        List<UserStoreEntity> list = userStoreRepository.findByUserId(userId);

        return list.stream()
                .map(us -> MyItemResponse.builder()
                        .userStoreId(us.getUserStoreId())
                        .category(us.getItem().getCategory().name())
                        .image(us.getItem().getImage())
                        .build()
                )
                .toList();
    }

    public void clearFrame(Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        user.setProfileFrame(null);
    }

    public void clearBadge(Integer userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));
        user.setProfileBadge(null);
    }

    @Transactional
    public void updateProfile(Integer userId, UserUpdateRequest req) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        if (req.getNickname() != null) user.setNickname(req.getNickname());
        if (req.getProfileFrame() != null) user.setProfileFrame(req.getProfileFrame());
        if (req.getProfileBadge() != null) user.setProfileBadge(req.getProfileBadge());
        if (req.getAvatarIcon() != null) user.setAvatarIcon(req.getAvatarIcon());
        if (req.getLoginId() != null) user.setLoginId(req.getLoginId());
    }
}
