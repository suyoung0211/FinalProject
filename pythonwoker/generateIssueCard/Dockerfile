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
COPY pythonwoker/generateIssueCard/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ==========================
# 4️⃣ 소스코드 복사
# ==========================
COPY pythonwoker/generateIssueCard/generateIssueCard.py .

# ==========================
# 5️⃣ 컨테이너 포트
# ==========================
# 워커 내부에서 Flask API 사용 시 포트 노출 (기본 5001)
EXPOSE 5001

# ==========================
# 6️⃣ 실행 명령
# ==========================
CMD ["sh", "-c", "python generateIssueCard.py"]
##