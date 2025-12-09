package org.usyj.makgora.store.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.usyj.makgora.store.request.StoreItemCreateRequest;
import org.usyj.makgora.store.service.StoreAdminService;

@RestController
@RequestMapping("/api/admin/store")
@RequiredArgsConstructor
public class StoreAdminController {

    private final StoreAdminService storeAdminService;

    /** 🔥 Cloudinary 이미지 업로드 */
    @PostMapping("/upload-image")
    public Object uploadImage(@RequestParam("file") MultipartFile file) {
        return storeAdminService.uploadImage(file);
    }

    /** 🔥 이미지 폴더 목록 가져오기 */
    @GetMapping("/images")
    public Object getImages(@RequestParam String folder) {
        return storeAdminService.getImagesByFolder(folder);
    }

    /** 🔥 아이템 생성 */
    @PostMapping("/items")
    public Object createItem(@RequestBody StoreItemCreateRequest req) {
        return storeAdminService.createItem(req);
    }

    /** 🔥 전체 아이템 조회 */
    @GetMapping("/items")
    public Object getItems() {
        return storeAdminService.getItems();
    }

    /** 🔥 아이템 삭제 */
    @DeleteMapping("/items/{id}")
    public Object deleteItem(@PathVariable Integer id) {
        return storeAdminService.deleteItem(id);
    }
}
