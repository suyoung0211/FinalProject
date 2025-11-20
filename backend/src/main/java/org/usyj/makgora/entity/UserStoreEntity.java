package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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
    private Users user;   // Users 엔티티 필요

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