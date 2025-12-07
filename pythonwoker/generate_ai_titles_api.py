# pythonwoker/generate_ai_titles_api.py
import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel
import logging
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# from generateIssueCard import (
#     run_issue_for_article,
#     run_issue_for_community,
# )
from generateAiTitle import run_generate_ai_titles


class ArticleIdRequest(BaseModel):
    articleId: int


class CommunityPostIdRequest(BaseModel):
    communityPostId: int


app = FastAPI()


# 1) 단일 article Issue 생성
@app.post("/generate-for-article")
def generate_for_article(req: ArticleIdRequest):
    logger.info(f"[API] /generate-for-article called, articleId={req.articleId}")
    result = run_issue_for_article(req.articleId)
    logger.info(f"[API] /generate-for-article result={result}")
    return result


# 2) 단일 커뮤니티 게시글 Issue 생성
@app.post("/generate-for-community")
def generate_for_community(req: CommunityPostIdRequest):
    logger.info(f"[API] /generate-for-community called, communityPostId={req.communityPostId}")
    result = run_issue_for_community(req.communityPostId)
    logger.info(f"[API] /generate-for-community result={result}")
    return result


# ===============================
# 3) AI 제목 전체 생성
# ===============================
@app.post("/generate-ai-titles")
def generate_ai_titles():
    """
    🔹 모든 RSS 기사에 대해 AI 제목 생성 실행
    🔹 Python 내부 run_generate_ai_titles() 호출
    🔹 summary와 failed_articles를 기반으로 API 응답 구성
    """

    # 1️⃣ 기사별 AI 제목 생성 실행
    results = run_generate_ai_titles()  # dict 반환

    # 2️⃣ dict에서 summary와 failed_articles 추출
    summary = results.get("summary", {})
    failed_articles = results.get("failed_articles", [])

    # 3️⃣ 성공, 실패, 건너뜀 집계
    success_count = summary.get("success_count", 0)
    failed_count = summary.get("failed_count", 0)
    skipped_count = summary.get("skipped_count", 0)

    # 4️⃣ 실패 기사 로그 출력
    logger.info(f"AI 제목 생성 완료: SUCCESS={success_count}, FAILED={failed_count}, SKIPPED={skipped_count}")
    for r in failed_articles:
        logger.error(f"[FAILED] article_id={r.get('article_id')} error={r.get('error')}")

    # 5️⃣ API 응답 구성
    return {
        "status": results.get("status", "completed"),
        "message": results.get("message", "AI 제목 생성 완료"),
        "summary": {
            "success_count": success_count,
            "failed_count": failed_count,
            "skipped_count": skipped_count,
        },
        "failed_articles": [
            {"article_id": r.get("article_id"), "error": r.get("error")}
            for r in failed_articles
        ],
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
