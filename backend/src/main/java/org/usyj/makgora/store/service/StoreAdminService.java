package org.usyj.makgora.store.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.profile.service.ImageService;
import org.usyj.makgora.store.entity.StoreItemEntity;
import org.usyj.makgora.store.entity.UserStoreEntity;
import org.usyj.makgora.store.repository.StoreItemRepository;
import org.usyj.makgora.store.repository.UserStoreRepository;
import org.usyj.makgora.store.request.StoreItemCreateRequest;
import org.usyj.makgora.user.entity.UserEntity;

import java.util.List;
import java.util.Map;
@Service
@RequiredArgsConstructor
@Transactional
public class StoreAdminService {

    private final UserStoreRepository userStoreRepository;
    private final StoreItemRepository storeItemRepository;
    private final ImageService imageService;
    private final Cloudinary cloudinary;

    /** 🔥 Cloudinary 폴더 이미지 조회 */
    public Object getImagesByFolder(String folder) {
        try {
            Map result = cloudinary.search()
                .expression("folder=" + folder)
                .sortBy("public_id", "asc")
                .maxResults(200)
                .execute();

            return result.get("resources");
        } catch (Exception e) {
            throw new RuntimeException("Cloudinary 이미지 조회 실패: " + e.getMessage());
        }
    }

    /** 🔥 Cloudinary 업로드 */
    public String uploadImage(MultipartFile file) {
        return imageService.uploadImage(file, "frames");
    }

    /** 🔥 아이템 생성 */
    public StoreItemEntity createItem(StoreItemCreateRequest req) {

        StoreItemEntity item = StoreItemEntity.builder()
                .name(req.getName())
                .category(StoreItemEntity.Category.valueOf(req.getCategory()))
                .type(StoreItemEntity.ItemType.valueOf(req.getType()))
                .price(req.getPrice())
                .stock(req.getStock())
                .image(req.getImage())   // URL 또는 Emoji
                .build();

        return storeItemRepository.save(item);
    }

    /** 🔥 전체 아이템 조회 */
    public List<StoreItemEntity> getItems() {
        return storeItemRepository.findAll();
    }

    /** 🔥 아이템 삭제 */
    @Transactional
public String deleteItem(Integer itemId) {

    StoreItemEntity item = storeItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("아이템 없음"));

    // 1) 이 아이템을 구매한 유저 목록 가져오기
    List<UserStoreEntity> ownedUsers = userStoreRepository.findByItem(item);

    for (UserStoreEntity us : ownedUsers) {
        UserEntity user = us.getUser();

        // 현재 프로필에 설정된 것과 같으면 초기화
        if (item.getCategory() == StoreItemEntity.Category.FRAME &&
            item.getImage().equals(user.getProfileFrame())) {
            user.setProfileFrame(null);
        }

        if (item.getCategory() == StoreItemEntity.Category.BADGE &&
            item.getImage().equals(user.getProfileBadge())) {
            user.setProfileBadge(null);
        }
    }

    // 2) UserStore(구매 목록)에서 삭제
    userStoreRepository.deleteAll(ownedUsers);

    // 3) Cloudinary 이미지 삭제 (프레임일 경우만)
    if (item.getImage() != null && item.getCategory() == StoreItemEntity.Category.FRAME) {
        imageService.deleteImage(item.getImage());
    }

    // 4) 상점 아이템 삭제
    storeItemRepository.delete(item);

    return "삭제 완료";
}

    /** 🔥 Cloudinary 이미지 삭제 */
    public String deleteCloudImage(String publicId) {
    try {
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        return "삭제 성공: " + result.get("result");
    } catch (Exception e) {
        throw new RuntimeException("Cloudinary 이미지 삭제 실패: " + e.getMessage());
    }
}
}
