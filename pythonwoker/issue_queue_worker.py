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

            if raw:
                print(f"📌 Queue Received: {raw}")

                if raw.startswith("article:"):
                    article_id = int(raw.split(":")[1])
                    print(f"➡ Processing Article Issue: {article_id}")
                    result = run_issue_for_article(article_id)
                    print("📝 Result:", result)

                elif raw.startswith("cp:"):
                    post_id = int(raw.split(":")[1])
                    print(f"➡ Processing Community Issue: {post_id}")
                    result = run_issue_for_community(post_id)
                    print("📝 Result:", result)

        except Exception as e:
            print("❌ Worker Exception:", e)
            traceback.print_exc()


if __name__ == "__main__":
    worker()
