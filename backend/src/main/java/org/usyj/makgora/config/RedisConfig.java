package org.usyj.makgora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class RedisConfig {

    // Redis 호스트, 포트, 비밀번호를 환경변수 또는 properties 에서 주입받음
    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    /**
     * LettuceConnectionFactory 생성 시 "패스워드 포함" 설정을 위해
     * RedisStandaloneConfiguration 객체를 사용해야 한다.
     * Cloud Redis(또는 Redis Labs)는 비밀번호 인증이 필수이므로 실무에서 반드시 이 형태를 사용한다.
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {

        // 단일 Redis 서버 설정
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);                 // Redis 호스트
        config.setPort(redisPort);                     // Redis 포트

        // 패스워드 설정 (NULL 또는 빈 문자열이면 인증 실패 발생)
        config.setPassword(RedisPassword.of(redisPassword));  // Redis 비밀번호

        return new LettuceConnectionFactory(config);
    }

    /**
     * 문자열 기반 RedisTemplate
     * key/value 모두 문자열 직렬화 사용
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(LettuceConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }

    /**
     * 일반 RedisTemplate
     * 기본적으로 key-value 모두 String 직렬화를 적용
     */
    @Bean
    public RedisTemplate<String, String> redisTemplate(LettuceConnectionFactory factory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 직렬화 방식 설정 (문자열)
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());

        return template;
    }
}
