# ============================
# 1️⃣ 빌드 단계: Maven + JDK
# ============================
FROM maven:3.9.2-eclipse-temurin-17 AS build
WORKDIR /app

# pom.xml 먼저 복사 → 의존성 캐시 활용
COPY pom.xml . 
# src 폴더 전체 복사
COPY src ./src

# Maven 빌드 (테스트 생략)
RUN mvn clean package -DskipTests

# ============================
# 2️⃣ 런타임 단계: 경량 JDK + 시간대 설정
# ============================
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# tzdata 설치 후 시간대 설정
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone \
    && apk del tzdata  # 설치 후 tzdata 제거해서 이미지 경량화

# 환경변수 TZ 설정 (Java에서도 사용)
ENV TZ=Asia/Seoul

# 빌드 단계에서 만든 jar 파일 복사
COPY --from=build /app/target/*.jar app.jar

# 외부에 노출할 포트
EXPOSE 8080

# 컨테이너 실행 시 명령
ENTRYPOINT ["java", "-jar", "app.jar"]