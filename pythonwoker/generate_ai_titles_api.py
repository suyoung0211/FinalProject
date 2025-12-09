# pythonwoker/generate_ai_titles_api.py
import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from generateAiTitle import run_generate_ai_titles

app = FastAPI()

# 3) AI 제목 전체 생성
@app.post("/generate-ai-titles")
def generate_ai_titles():
    # 1) 기사별 AI 제목 생성 실행
    result_data = run_generate_ai_titles()  # 현재 딕셔너리 반환

    # 2) summary와 failed_summary에서 값 가져오기
    summary = result_data.get("summary", {})
    failed_summary = result_data.get("failed_summary", [])

    # 3) 카운트 추출
    success_count = summary.get("success_count", 0)
    failed_count = summary.get("failed_count", 0)
    skipped_count = summary.get("skipped_count", 0)

    # 4) failed_articles를 failed_summary 기준으로 구성
    failed_articles = [
        {"reason": f["reason"], "count": f["count"]}
        for f in failed_summary
    ]

    # 5) 로그 출력 (백엔드 콘솔용)
    logger.info(f"AI 제목 생성 완료: SUCCESS={success_count}, FAILED={failed_count}, SKIPPED={skipped_count}")
    for f in failed_articles:
        logger.error(f"[FAILED] reason={f['reason']} count={f['count']}")

    # 6) API 응답
    return {
        "status": "completed",
        "message": "AI 제목 생성 완료",
        "summary": {
            "success_count": success_count,
            "failed_count": failed_count,
            "skipped_count": skipped_count,
        },
        "failed_articles": failed_articles,
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # PORT 환경변수 사용, 없으면 8000
    uvicorn.run(app, host="0.0.0.0", port=port)
