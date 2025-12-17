package org.usyj.makgora.vote.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.usyj.makgora.user.entity.UserEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "normal_vote_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormalVoteCommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 🔗 NormalVote FK */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "normal_vote_id", nullable = false)
    private NormalVoteEntity normalVote;

    /** 🔗 User FK */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    /** 🔗 Parent Reply */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private NormalVoteCommentEntity parent;

    /** 🔗 Children replies */
    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<NormalVoteCommentEntity> children = new ArrayList<>();

    private String content;

    @Builder.Default
    private Integer likeCount = 0;

    @Builder.Default
    private Integer dislikeCount = 0;

    @Builder.Default
    private Boolean isDeleted = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

}
