package org.usyj.makgora.rssfeed.service;

import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.usyj.makgora.rssfeed.dto.RssArticleDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class RssParserService {

    public ArrayList<RssArticleDTO> parse(String feedUrl) {
        // RSS 파싱 로직 (Rome / Jsoup 사용)
        return new ArrayList<>();
    }
}