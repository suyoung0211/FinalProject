package org.usyj.makgora.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.usyj.makgora.entity.UserEntity;
import org.usyj.makgora.repository.UserRepository;
import org.usyj.makgora.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository repo;

  @Override
  public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
    UserEntity user = repo.findByLoginId(loginId)
        .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + loginId));

    return new CustomUserDetails(user);
  }
}
