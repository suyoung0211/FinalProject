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

    # 🔹 문자열이 섞여 들어오는 경우 대비 변환
    normalized_results = []
    for r in result_data:
        if isinstance(r, dict):
            normalized_results.append(r)
        else:
            # 문자열이면 임시 실패 처리하여 구조 통일
            normalized_results.append({
                "article_id": None,  # 필요 시 수정 가능
                "status": str(r),
                "error": str(r)
            })
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

# 3) AI 제목 전체 생성
@app.post("/generate-ai-titles")
def generate_ai_titles():
    # 1) 기사별 AI 제목 생성 실행
    results = run_generate_ai_titles()

    # 2) 성공/실패/건너뜀 집계
    success_count = sum(1 for r in results if r["status"] == "SUCCESS")
    failed_articles = [r for r in results if r["status"] in ["FAILED", "DB_COMMIT_FAILED", "PROCESS_ERROR"]]
    failed_count = len(failed_articles)
    skipped_count = sum(1 for r in results if r["status"] in ["ALREADY_EXISTS", "SKIPPED_MAX_TRY"])

    # 3) 로그 출력 (백엔드 콘솔용)
    logger.info(f"AI 제목 생성 완료: SUCCESS={success_count}, FAILED={failed_count}, SKIPPED={skipped_count}")
    for r in failed_articles:
        logger.error(f"[FAILED] article_id={r['article_id']} error={r['error']}")

    # 4) API 응답
    return {
        "status": "completed",
        "message": "AI 제목 생성 완료",
        "summary": {
            "success_count": success_count,
            "failed_count": failed_count,
            "skipped_count": skipped_count,
        },
        "failed_articles": [
            {"article_id": r["article_id"], "error": r["error"]}
            for r in failed_articles
        ],
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # PORT 환경변수 사용, 없으면 8000
    uvicorn.run(app, host="0.0.0.0", port=port)
