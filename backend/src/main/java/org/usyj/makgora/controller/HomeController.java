package org.usyj.makgora.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.article.service.ArticleListService;
import org.usyj.makgora.response.home.HomeResponse;
import org.usyj.makgora.service.HomeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;
    private final ArticleListService articleListService;

    @GetMapping
    public ResponseEntity<HomeResponse> getHome() {
        return ResponseEntity.ok(homeService.getHomeData());
    }

    @GetMapping("/articles/latest")
    public ResponseEntity<?> getLatestArticles() {
        return ResponseEntity.ok(articleListService.getLatestArticles());
    }
}