# pythonwoker/generate_ai_titles_api.py
import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from generateIssueCard import (
    run_issue_for_article,
    run_issue_for_community,
)
from generateAiTitle import run_generate_ai_titles
import uvicorn


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


# 3) AI 제목 전체 생성
@app.post("/generate-ai-titles")
def generate_ai_titles():
    # run_generate_ai_titles가 기사별 상태 리스트를 반환하도록 이미 수정
    results = run_generate_ai_titles()
    return {
        "status": "completed",
        "message": "AI 제목 생성 완료",
        "results": results  # 각 기사별 상태와 오류 정보를 포함
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
