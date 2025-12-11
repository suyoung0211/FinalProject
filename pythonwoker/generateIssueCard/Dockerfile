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
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir supervisor

# ==========================
# 4️⃣ 소스코드 복사
# ==========================
COPY pythonwoker/generateIssueCard/generateIssueCard.py .
COPY pythonwoker/generateIssueCard/issue_queue_worker.py .

# ==========================
# 5️⃣ Supervisor 설정 파일 복사
# ==========================
COPY pythonwoker/generateIssueCard/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ==========================
# 6️⃣ 컨테이너 포트 (Flask용)
# ==========================
EXPOSE 5001

# ==========================
# 7️⃣ 컨테이너 시작 시 supervisord 실행
# ==========================
CMD ["supervisord", "-n"]
