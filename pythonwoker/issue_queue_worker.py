import time
import redis
import traceback
from generateIssueCard import run_issue_for_article, run_issue_for_community

# Redis 연결
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
QUEUE = "ISSUE_TRIGGER_QUEUE"

def worker():
    print("🔄 Issue Queue Worker started. Listening for jobs...")

    while True:
        try:
            raw = r.rpop(QUEUE)

            if raw is None:
                time.sleep(0.3)
                continue

            print(f"📌 Queue Received: {raw}")

            # ARTICLE
            if raw.startswith("article:"):
                article_id = int(raw.split(":")[1])
                print(f"➡ Processing Article Issue: {article_id}")

                result = run_issue_for_article(article_id)
                print("📝 Result:", result)

                # 🔥 article에도 triggered flag 저장
                if result.get("status") in ["success", "ignored_vote_exists", "ignored"]:
                    r.set(f"article:{article_id}:triggered", "1")

            # COMMUNITY
            elif raw.startswith("cp:"):
                post_id = int(raw.split(":")[1])
                print(f"➡ Processing Community Issue: {post_id}")

                result = run_issue_for_community(post_id)
                print("📝 Result:", result)

                # 🔥 community에도 triggered flag 저장
                if result.get("status") in ["success", "ignored_vote_exists", "ignored"]:
                    r.set(f"cp:{post_id}:triggered", "1")

        except Exception as e:
            print("❌ Worker Exception:", e)
            traceback.print_exc()
            time.sleep(1)  # 문제 발생 시 딜레이

if __name__ == "__main__":
    worker()
