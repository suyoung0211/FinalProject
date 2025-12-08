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


@app.post("/generate-ai-titles")
def generate_ai_titles():
    # run_generate_ai_titles()는 dict를 반환함!
    result = run_generate_ai_titles()

    summary = result.get("summary", {})
    failed_articles = result.get("failed_articles", [])

    return {
        "status": "completed",
        "message": "AI 제목 생성 완료",
        "summary": {
            "success_count": summary.get("success_count", 0),
            "failed_count": summary.get("failed_count", 0),
            "skipped_count": summary.get("skipped_count", 0),
        },
        "failed_articles": failed_articles
    }

# # 3) AI 제목 전체 생성
# @app.post("/generate-ai-titles")
# def generate_ai_titles():
#     # 1) 기사별 AI 제목 생성 실행
#     results = run_generate_ai_titles()

#     # 2) 성공/실패/건너뜀 집계
#     success_count = sum(1 for r in results if r["status"] == "SUCCESS")
#     failed_articles = [r for r in results if r["status"] in ["FAILED", "DB_COMMIT_FAILED", "PROCESS_ERROR"]]
#     failed_count = len(failed_articles)
#     skipped_count = sum(1 for r in results if r["status"] in ["ALREADY_EXISTS", "SKIPPED_MAX_TRY"])

#     # 3) 로그 출력 (백엔드 콘솔용)
#     logger.info(f"AI 제목 생성 완료: SUCCESS={success_count}, FAILED={failed_count}, SKIPPED={skipped_count}")
#     for r in failed_articles:
#         logger.error(f"[FAILED] article_id={r['article_id']} error={r['error']}")

#     # 4) API 응답
#     return {
#         "status": "completed",
#         "message": "AI 제목 생성 완료",
#         "summary": {
#             "success_count": success_count,
#             "failed_count": failed_count,
#             "skipped_count": skipped_count,
#         },
#         "failed_articles": [
#             {"article_id": r["article_id"], "error": r["error"]}
#             for r in failed_articles
#         ],
#     }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
