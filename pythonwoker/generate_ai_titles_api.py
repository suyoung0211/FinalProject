# pythonwoker/generate_ai_titles_api.py
import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel

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
    result = run_issue_for_article(req.articleId)
    return result


# 2) 단일 커뮤니티 게시글 Issue 생성
@app.post("/generate-for-community")
def generate_for_community(req: CommunityPostIdRequest):
    result = run_issue_for_community(req.communityPostId)
    return result


# 3) AI 제목 전체 생성
@app.post("/generate-ai-titles")
def generate_ai_titles():
    run_generate_ai_titles()
    return {"status": "success", "message": "ai titles generated"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
