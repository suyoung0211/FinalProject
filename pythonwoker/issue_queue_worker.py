# pythonworker/worker_vote.py
import time
import redis
import traceback
from generateIssueCard import run_vote_for_issue

# Redis 연결
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
VOTE_QUEUE = "VOTE_TRIGGER_QUEUE"

def worker():
    print("🔄 Vote Queue Worker started. Listening for jobs...")

    while True:
        try:
            # 🔥 Blocking pop → 메시지 들어올 때까지 대기
            queue, raw = r.brpop(VOTE_QUEUE)  
            print(f"📌 VoteQueue Received: {raw}")

            if raw.startswith("issue:"):
                issue_id = int(raw.split(":")[1])
                print(f"➡ Processing Issue → Vote: {issue_id}")

                result = run_vote_for_issue(issue_id)
                print("📝 Result:", result)

                # 성공/이미 생성/무시 등 상태일 때 triggered flag 설정
                if result.get("status") in ["success", "ignored", "ignored_vote_exists"]:
                    r.set(f"issue:{issue_id}:voteCreated", "1")

        except Exception as e:
            print("❌ Vote Worker Exception:", e)
            traceback.print_exc()
            time.sleep(1)
