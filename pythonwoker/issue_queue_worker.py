# pythonworker/worker_vote.py
import os
import time
import redis
import traceback
from dotenv import load_dotenv
from generateIssueCard import run_vote_for_issue

# .env 로드
load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")


# ---------------------------------------------
# Redis 클라이언트 생성 (Cloud + Local 지원)
# ---------------------------------------------
def create_redis_client():
    host = REDIS_HOST
    port = int(REDIS_PORT)
    pwd = REDIS_PASSWORD

    # 🔥 비밀번호가 없으면 password 제거
    if pwd is None or pwd.strip() == "":
        print("[REDIS] worker_vote → 로컬 모드: 비밀번호 없이 접속")
        return redis.Redis(
            host=host,
            port=port,
            db=0,
            decode_responses=True
        )

    # 🔥 비밀번호가 있을 때만 인증 사용
    print("[REDIS] worker_vote → 배포 모드: 비밀번호 인증 접속")
    return redis.Redis(
        host=host,
        port=port,
        password=pwd,
        db=0,
        decode_responses=True
    )


r = create_redis_client()
VOTE_QUEUE = "VOTE_TRIGGER_QUEUE"


# ---------------------------------------------
# Vote Worker
# ---------------------------------------------
def worker():
    print("🔄 Vote Queue Worker started. Listening for jobs...")

    while True:
        try:
            raw = r.rpop(VOTE_QUEUE)

            if raw is None:
                time.sleep(0.3)
                continue

            print(f"📌 VoteQueue Received: {raw}")

            if raw.startswith("issue:"):
                issue_id = int(raw.split(":")[1])
                print(f"➡ Processing Issue → Vote: {issue_id}")

                result = run_vote_for_issue(issue_id)
                print("📝 Result:", result)

                # 성공/이미 생성/무시 등 상태일 때 Redis에 플래그 저장
                if result.get("status") in ["success", "ignored", "ignored_vote_exists"]:
                    r.set(f"issue:{issue_id}:voteCreated", "1")

        except Exception as e:
            print("❌ Vote Worker Exception:", e)
            traceback.print_exc()
            time.sleep(1)