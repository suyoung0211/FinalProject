# ============================
# 1️⃣ 베이스 이미지
# Python 3.11 사용
# ============================
FROM python:3.11-slim

# ============================
# 2️⃣ 작업 디렉토리 설정
# ============================
WORKDIR /app

# ============================
# 3️⃣ 종속성 복사
# requirements.txt 먼저 복사 → 캐시 활용
# ============================
COPY requirements.txt .

# ============================
# 4️⃣ 패키지 설치
# ============================
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ============================
# 5️⃣ 소스코드 복사
# ============================
COPY . .

# ============================
# 6️⃣ 환경변수 기본값 (Railway에 이미 넣었다면 생략 가능)
# ============================
# ENV DB_URL=mysql://username:password@host:port/dbname
# ENV OPENAI_API_KEY=your_openai_api_key
# ENV BACKEND_VOTE_URL=http://backend-service:8080/api/issues/ai-create
# ENV REDIS_HOST=your_redis_host
# ENV REDIS_PORT=6379

# ============================
# 7️⃣ 컨테이너 포트
# Railway는 $PORT 사용, 기본 5001
# ============================
EXPOSE 5001

# ============================
# 8️⃣ 실행 명령
# Railway에서 $PORT 환경변수를 읽도록 Flask 실행
# ============================
CMD ["sh", "-c", "python generateIssueCard.py"]
