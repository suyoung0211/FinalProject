# pythonworker/main_worker.py
import threading
from generateIssueCard.generateIssueCard import worker as issue_worker
from worker_vote import worker as vote_worker

def start_issue_worker():
    print("🚀 Issue Worker Thread 시작!")
    issue_worker()

def start_vote_worker():
    print("🔥 Vote Worker Thread 시작!")
    vote_worker()

if __name__ == "__main__":
    print("=== Makgora AI Worker Server START ===")

    # 스레드 생성
    t1 = threading.Thread(target=start_issue_worker, daemon=True)
    t2 = threading.Thread(target=start_vote_worker, daemon=True)

    # 실행
    t1.start()
    t2.start()

    print("두 Worker가 하나의 서버에서 동시에 작동 중입니다.")
    
    # 메인 스레드를 무한 루프로 유지
    while True:
        pass
