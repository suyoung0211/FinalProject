package org.usyj.makgora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Admin_Actions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AdminActionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long actionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private UserEntity admin;

    @Column(nullable = false)
    private String actionType;

    private String targetType;

    private Long targetId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}