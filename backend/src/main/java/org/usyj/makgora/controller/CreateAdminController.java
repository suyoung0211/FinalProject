package org.usyj.makgora.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.request.CreateAdminRequest;
import org.usyj.makgora.service.CreateAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/create")
@RequiredArgsConstructor
public class CreateAdminController {

    private final CreateAdminService createAdminService;

    /**
     * 슈퍼어드민 전용 관리자 추가
     */
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<UserEntity> createAdmin(@RequestBody CreateAdminRequest request) {
        UserEntity newAdmin = createAdminService.createAdmin(
                request.getLoginId(),
                request.getNickname(),
                request.getPassword(),
                request.getVerificationEmail()
                
        );
        return ResponseEntity.ok(newAdmin);
    }
}