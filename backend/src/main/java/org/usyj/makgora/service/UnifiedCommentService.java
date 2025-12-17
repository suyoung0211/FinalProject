package org.usyj.makgora.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.usyj.makgora.article.entity.ArticleCommentEntity;
import org.usyj.makgora.article.repository.ArticleCommentRepository;
import org.usyj.makgora.community.entity.CommunityCommentEntity;
import org.usyj.makgora.community.repository.CommunityCommentRepository;
import org.usyj.makgora.repository.CommentRepository;
import org.usyj.makgora.vote.dto.response.UnifiedCommentResponse;
import org.usyj.makgora.vote.dto.response.UnifiedCommentResponse.CommentSource;
import org.usyj.makgora.vote.entity.VoteCommentEntity;

import lombok.RequiredArgsConstructor;

/**
 * 통합 댓글 서비스
 * - 이슈 댓글, 커뮤니티 댓글, 기사 댓글을 하나의 DTO로 통합 관리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnifiedCommentService {

    private final CommentRepository commentRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final ArticleCommentRepository articleCommentRepository;

    /**
     * 관리자용: 모든 댓글 조회 (최신순)
     */
    public List<UnifiedCommentResponse> getAllComments() {
        List<UnifiedCommentResponse> result = new ArrayList<>();

        // 이슈 댓글들 가져오기
        List<VoteCommentEntity> issueComments = commentRepository.findAll();
        for (VoteCommentEntity c : issueComments) {
            result.add(convertToUnified(c, CommentSource.ISSUE));
        }

        // 커뮤니티 댓글들 가져오기
        List<CommunityCommentEntity> communityComments = communityCommentRepository.findAll();
        for (CommunityCommentEntity c : communityComments) {
            result.add(convertToUnified(c, CommentSource.COMMUNITY));
        }

        // 기사 댓글들 가져오기
        List<ArticleCommentEntity> articleComments = articleCommentRepository.findAll();
        for (ArticleCommentEntity c : articleComments) {
            result.add(convertToUnified(c, CommentSource.ARTICLE));
        }

        // 시간순 정렬 (최신순)
        return result.stream()
                .sorted(Comparator.comparing(UnifiedCommentResponse::getCreatedAt).reversed())
                .toList();
    }

    /**
     * 프로필용: 특정 유저의 모든 댓글 조회 (최신순)
     */
    public List<UnifiedCommentResponse> getUserComments(Integer userId) {
        List<UnifiedCommentResponse> result = new ArrayList<>();

        // 이슈 댓글
        List<VoteCommentEntity> issueComments = commentRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        for (VoteCommentEntity c : issueComments) {
            result.add(convertToUnified(c, CommentSource.ISSUE));
        }

        // 커뮤니티 댓글
        List<CommunityCommentEntity> communityComments = communityCommentRepository.findByUserId(userId);
        for (CommunityCommentEntity c : communityComments) {
            result.add(convertToUnified(c, CommentSource.COMMUNITY));
        }

        // 기사 댓글
        List<ArticleCommentEntity> articleComments = articleCommentRepository.findByUserId(userId);
        for (ArticleCommentEntity c : articleComments) {
            result.add(convertToUnified(c, CommentSource.ARTICLE));
        }

        // 시간순 정렬 (최신순)
        return result.stream()
                .sorted(Comparator.comparing(UnifiedCommentResponse::getCreatedAt).reversed())
                .toList();
    }

    /**
     * 이슈 댓글을 통합 DTO로 변환
     */
    private UnifiedCommentResponse convertToUnified(VoteCommentEntity entity, CommentSource source) {
        return UnifiedCommentResponse.builder()
                .commentId(entity.getCommentId())
                .content(entity.getContent())
                .authorName(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .source(source)
                .sourceId(entity.getIssue().getId().longValue())  // Integer → Long 변환
                .sourceTitle(entity.getIssue().getTitle())
                .position(entity.getPosition())  // 이슈 댓글만: 찬성/반대/중립
                .build();
    }

    /**
     * 커뮤니티 댓글을 통합 DTO로 변환
     */
    private UnifiedCommentResponse convertToUnified(CommunityCommentEntity entity, CommentSource source) {
        return UnifiedCommentResponse.builder()
                .commentId(entity.getCommentId())
                .content(entity.getContent())
                .authorName(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .source(source)
                .sourceId(entity.getPost().getPostId())  // Long 타입
                .sourceTitle(entity.getPost().getTitle())
                .likeCount(entity.getLikeCount() != null ? entity.getLikeCount() : 0)  // 커뮤니티 댓글만
                .build();
    }

    /**
     * 기사 댓글을 통합 DTO로 변환
     */
    private UnifiedCommentResponse convertToUnified(ArticleCommentEntity entity, CommentSource source) {
        return UnifiedCommentResponse.builder()
                .commentId(entity.getId())
                .content(entity.getContent())
                .authorName(entity.getUser().getNickname())
                .createdAt(entity.getCreatedAt())
                .source(source)
                .sourceId(entity.getArticle().getId().longValue())  // Integer → Long 변환
                .sourceTitle(entity.getArticle().getTitle())
                .likeCount(entity.getLikeCount() != null ? entity.getLikeCount() : 0)  // 기사 댓글만
                .build();
    }
}
