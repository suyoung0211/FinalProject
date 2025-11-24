package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Article_Categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer id;

    @Column(nullable = false, length = 100, unique = true)
    private String name;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // 양방향 다대다 매핑: 이 카테고리에 속한 기사들
    @ManyToMany(mappedBy = "categories")
    private List<RssArticleEntity> articles;
}