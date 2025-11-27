package org.usyj.makgora.response.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.usyj.makgora.entity.ArticleCategoryEntity;
import org.usyj.makgora.entity.IssueEntity;
import org.usyj.makgora.entity.VoteEntity;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueWithVotesResponse {

    private Integer issueId;
    private String title;
    private String thumbnail;

    /** 기사 카테고리 이름 리스트 */
    private List<String> categories;

    /** 이 이슈에 속한 투표들 */
    private List<VoteResponse> votes;

    public static IssueWithVotesResponse of(
            IssueEntity issue,
            List<VoteEntity> votes,
            List<VoteResponse> voteResponses
    ) {

        List<String> categoryNames = null;

        if (issue.getArticle() != null && issue.getArticle().getCategories() != null) {
            categoryNames = issue.getArticle().getCategories().stream()
                    .map(ArticleCategoryEntity::getName)
                    .collect(Collectors.toList());
        }

        return IssueWithVotesResponse.builder()
                .issueId(issue.getId())
                .title(issue.getTitle())
                .thumbnail(issue.getThumbnail())
                .categories(categoryNames)
                .votes(voteResponses)
                .build();
    }
}
