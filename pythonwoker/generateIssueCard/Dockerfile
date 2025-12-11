# ==========================
# 1️⃣ 베이스 이미지
# ==========================
FROM python:3.11-slim

# ==========================
# 2️⃣ 작업 디렉토리 및 로그 디렉토리 생성
# ==========================
WORKDIR /app
RUN mkdir -p /app/logs
# Supervisor 및 프로그램 로그 저장용

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
# 5️⃣ Supervisor 메인 설정 파일 복사
# ==========================
COPY pythonwoker/generateIssueCard/supervisord.conf /etc/supervisord.conf

# ==========================
# 6️⃣ 컨테이너 포트 (Flask용)
# ==========================
EXPOSE 5001

# ==========================
# 7️⃣ 컨테이너 시작 시 supervisord 실행
# ==========================
# -n: foreground 실행, -c: config 파일 경로 지정
CMD ["supervisord", "-n", "-c", "/etc/supervisord.conf"]
