# ============================
# 1️⃣ 베이스 이미지
# Python 3.11 slim 버전 사용
# ============================
FROM python:3.11-slim

# ============================
# 2️⃣ 작업 디렉토리 설정
# ============================
WORKDIR /app

# ============================
# 3️⃣ 종속성 설치
# requirements.txt 먼저 복사 → 캐시 활용
# ============================
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ============================
# 4️⃣ 소스코드 복사
# ============================
COPY . .

# ============================
# 5️⃣ 컨테이너 포트 (Flask/Worker 내부)
# Railway는 $PORT 환경변수를 사용
# ============================
EXPOSE 5001

# ============================
# 6️⃣ 실행 명령
# Flask/Worker 실행 시 PORT 환경변수 사용
# ============================
CMD ["sh", "-c", "python generateIssueCard.py"]