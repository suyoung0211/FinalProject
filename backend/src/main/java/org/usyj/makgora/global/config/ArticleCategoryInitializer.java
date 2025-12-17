package org.usyj.makgora.global.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.usyj.makgora.article.entity.ArticleCategoryEntity;
import org.usyj.makgora.article.repository.ArticleCategoryRepository;

import java.util.Arrays;
import java.util.List;

@Component
public class ArticleCategoryInitializer implements ApplicationRunner {

    private final ArticleCategoryRepository categoryRepository;

    public ArticleCategoryInitializer(ArticleCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 초기 넣고 싶은 카테고리 리스트
        List<String> categories = Arrays.asList("정치", "경제", "IT/과학", "스포츠", "연예/문화", "세계", "사회", "한국");

        for (String name : categories) {
            // 이미 존재하면 삽입하지 않음
            categoryRepository.findByName(name)
                    .orElseGet(() -> categoryRepository.save(
                            ArticleCategoryEntity.builder()
                                    .name(name)
                                    .build()
                    ));
        }

        System.out.println("카테고리 초기 데이터 삽입 완료!");
    }
}
