# ==========================
# 1️⃣ 베이스 이미지
# ==========================
FROM python:3.11-slim

# ==========================
# 2️⃣ 작업 디렉토리
# ==========================
WORKDIR /app

# ==========================
# 3️⃣ 종속성 설치
# ==========================
COPY pythonworker/generateAiTitle/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ==========================
# 4️⃣ 소스코드 복사
# ==========================
COPY pythonworker/generateAiTitle/generateAiTitle.py .

# ==========================
# 5️⃣ 컨테이너 포트
# ==========================
EXPOSE 8000

# ==========================
# 6️⃣ 실행 명령
# ==========================
CMD ["sh", "-c", "uvicorn generateAiTitle:app --host 0.0.0.0 --port ${PORT:-8000}"]
