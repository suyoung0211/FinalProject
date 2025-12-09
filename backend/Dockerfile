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
# 2️⃣ 런타임 단계: 경량 JDK
# ============================
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# 빌드 단계에서 만든 jar 파일 복사
COPY --from=build /app/target/*.jar app.jar

# 외부에 노출할 포트
EXPOSE 8080

# 컨테이너 실행 시 명령
ENTRYPOINT ["java", "-jar", "app.jar"]