package org.usyj.makgora.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.usyj.makgora.service.NormalVoteService;

@RestController
@RequestMapping("/api/admin/normal-votes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminNormalVoteController {

    private final NormalVoteService normalVoteService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(normalVoteService.getAllVotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {
        return ResponseEntity.ok(normalVoteService.getDetailForAdmin(id));
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<?> finish(@PathVariable Integer id) {
        return ResponseEntity.ok(normalVoteService.finishVoteAdmin(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id) {
        normalVoteService.cancelVoteAdmin(id);
        return ResponseEntity.ok("Normal vote canceled by admin");
    }
}