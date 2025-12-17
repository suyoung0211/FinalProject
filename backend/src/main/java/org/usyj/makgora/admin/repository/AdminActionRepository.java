package org.usyj.makgora.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.usyj.makgora.admin.entity.AdminActionEntity;

public interface AdminActionRepository extends JpaRepository<AdminActionEntity, Long> {
}
