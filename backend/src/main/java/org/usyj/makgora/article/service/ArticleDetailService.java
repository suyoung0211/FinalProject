// src/main/java/org/usyj/makgora/service/ArticleDetailService.java
package org.usyj.makgora.article.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.dto.response.ArticleCommentResponse;
import org.usyj.makgora.article.dto.response.ArticleDetailResponse;
import org.usyj.makgora.article.entity.ArticleAiTitleEntity;
import org.usyj.makgora.article.entity.ArticleReactionEntity;
import org.usyj.makgora.article.repository.ArticleAiTitleRepository;
import org.usyj.makgora.article.repository.ArticleReactionRepository;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.RssArticleEntity;
import org.usyj.makgora.entity.VoteEntity;
import org.usyj.makgora.repository.IssueRepository;
import org.usyj.makgora.repository.VoteRepository;
import org.usyj.makgora.rssfeed.repository.RssArticleRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArticleDetailService {

    private final RssArticleRepository articleRepo;
    private final ArticleAiTitleRepository aiTitleRepo;
    private final ArticleReactionRepository reactionRepo;
    private final ArticleCommentService commentService;
    private final StringRedisTemplate redis;
    private final IssueRepository issueRepo;
    private final VoteRepository voteRepo;

    private static final String PREFIX = "article:";

    public ArticleDetailResponse getArticleDetail(Integer articleId, Integer currentUserId) {

        // 1) 기사 엔티티 조회
        RssArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("기사를 찾을 수 없습니다. id=" + articleId));

        // 2) AI 제목 조회 (✔ 리스트와 동일한 방식으로 통일)
        ArticleAiTitleEntity aiTitleEntity = aiTitleRepo.findByArticle_Id(articleId);
        String aiTitle = (aiTitleEntity != null && aiTitleEntity.getAiTitle() != null
                && !aiTitleEntity.getAiTitle().isBlank())
                ? aiTitleEntity.getAiTitle()
                : null;

        // 화면에 보여줄 최종 제목
        String finalTitle = (aiTitle != null) ? aiTitle : article.getTitle();

        // 3) 카테고리 DTO 변환
        List<ArticleDetailResponse.CategoryDto> categories = article.getCategories().stream()
                .map(c -> ArticleDetailResponse.CategoryDto.builder()
                        .categoryId(c.getId())
                        .name(c.getName())
                        .build())
                .collect(Collectors.toList());

        // 4) Redis 기반 카운트들 (없으면 DB fallback)
        long viewCount = getLongOrDefault(key(articleId, "view"), article.getViewCount());
        long likeCount = getLongOrDefault(key(articleId, "like"), article.getLikeCount());
        long dislikeCount = getLongOrDefault(key(articleId, "dislike"), article.getDislikeCount());
        long commentCount = getLongOrDefault(key(articleId, "comment"), article.getCommentCount());

        // 5) 현재 유저의 기사 반응 (-1 / 0 / 1)
        Integer userReaction = null;
        if (currentUserId != null) {
            ArticleReactionEntity reaction = reactionRepo
                    .findByArticleIdAndUserId(articleId, currentUserId)
                    .orElse(null);
            userReaction = (reaction != null) ? reaction.getReactionValue() : 0;
        }

        boolean liked = (userReaction != null && userReaction == 1);
        boolean disliked = (userReaction != null && userReaction == -1);

        // 6) 댓글 트리 (ArticleCommentService 재사용)
        List<ArticleCommentResponse> comments =
                commentService.getComments(articleId, currentUserId);

        // 6) 관련된 투표 찾기 (article → issue → vote)
Optional<IssueEntity> issueOpt = issueRepo.findByArticleId(articleId);

Integer connectedVoteId = null;
String connectedVoteStatus = null;

if (issueOpt.isPresent()) {
    IssueEntity issue = issueOpt.get();
    Integer issueId = issue.getId();

    Optional<VoteEntity> voteOpt = voteRepo.findByIssue_Id(issueId);

    if (voteOpt.isPresent()) {
        VoteEntity vote = voteOpt.get();
        connectedVoteId = vote.getId();
        connectedVoteStatus = vote.getStatus().name();  // 중요
    }
}

        // 7) 최종 DTO 조립
        return ArticleDetailResponse.builder()
                .articleId(article.getId())
                .title(finalTitle)
                .aiTitle(aiTitle)
                .originalTitle(article.getTitle())
                .publisher(article.getFeed().getSourceName())
                .content(article.getContent())
                .thumbnailUrl(article.getThumbnailUrl())
                .link(article.getLink())
                .createdAt(article.getCreatedAt())
                .publishedAt(article.getPublishedAt())
                .categories(categories)
                .viewCount(viewCount)
                .likeCount(likeCount)
                .dislikeCount(dislikeCount)
                .commentCount(commentCount)
                .aiSystemScore((long) article.getAiSystemScore())
                .userReaction(userReaction)
                .liked(liked)
                .disliked(disliked)
                .comments(comments)
                .connectedVoteId(connectedVoteId)
                .connectedVoteStatus(connectedVoteStatus)
                .build();
    }

    /* ======================= Redis Helper ======================== */

    private String key(Integer id, String type) {
        return PREFIX + id + ":" + type;
    }

    private long getLongOrDefault(String key, long defaultValue) {
        String v = redis.opsForValue().get(key);
        if (v == null) return defaultValue;
        try {
            return Long.parseLong(v);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
