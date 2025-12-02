package org.usyj.makgora.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.usyj.makgora.dto.home.HotIssueDto;
import org.usyj.makgora.entity.ArticleAiTitleEntity;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.response.home.HomeResponse;
import org.usyj.makgora.rssfeed.service.RssArticleService;
import org.usyj.makgora.service.ArticleListService;
import org.usyj.makgora.service.HomeService;
import org.usyj.makgora.rssfeed.repository.ArticleAiTitleRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

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