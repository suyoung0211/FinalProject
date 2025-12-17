package org.usyj.makgora.store.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.global.security.JwtTokenProvider;
import org.usyj.makgora.store.dto.request.StoreItemPurchaseRequest;
import org.usyj.makgora.store.service.StoreAdminService;
import org.usyj.makgora.store.service.StoreService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final StoreAdminService storeAdminService;
    private final JwtTokenProvider jwtTokenProvider;

    /** 아이템 목록 */
    @GetMapping("/items")
    public Object getItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type
    ) {
        return storeService.getItems(category, type);
    }

    /** 아이템 상세 */
    @GetMapping("/items/{id}")
    public Object getItem(@PathVariable Integer id) {
        return storeService.getItem(id);
    }

    @GetMapping("/frames")
    public Object getFrameImages() {
    return storeAdminService.getImagesByFolder("frame");
}
    
    /** 구매 */
    @PostMapping("/purchase")
    public Object purchase(
            HttpServletRequest request,
            @RequestBody StoreItemPurchaseRequest req
    ) {
        String token = request.getHeader("Authorization").substring(7);
        Integer userId = jwtTokenProvider.getUserId(token);

        return storeService.purchaseItem(userId, req);
    }

    /** 내 아이템 */
    @GetMapping("/my-items")
    public Object myItems(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Integer userId = jwtTokenProvider.getUserId(token);

        return storeService.getMyItems(userId);
    }
}