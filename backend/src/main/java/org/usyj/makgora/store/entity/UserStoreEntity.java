package org.usyj.makgora.store.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.usyj.makgora.user.entity.UserEntity;

@Entity
@Table(name = "User_Store")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserStoreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userStoreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private StoreItemEntity item;

    @Column(name = "purchased_at", updatable = false)
    private LocalDateTime purchasedAt;

    // 1 = refundable, 0 = not refundable
    private boolean refundable;

    @PrePersist
    public void prePersist() {
        this.purchasedAt = LocalDateTime.now();
        this.refundable = true;
    }
}