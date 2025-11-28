# generate_ai_titles_api.py

import os
import sys

# 현재 파일이 있는 경로를 PYTHONPATH에 추가 (패키지 인식용)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from fastapi import FastAPI
from generateIssueCard import run_issue_analysis
from generateAiTitle import run_generate_ai_titles
import uvicorn

app = FastAPI()

# # 1) 이슈 카드 생성만
# @app.post("/generate-issue-cards")
# def generate_issue_cards():
#     run_issue_analysis()
#     return {"status": "success", "message": "issue cards generated"}

# # 2) AI 제목만
# @app.post("/generate-ai-titles")
# def generate_ai_titles():
#     run_generate_ai_titles()
#     return {"status": "success", "message": "ai titles generated"}

# 3) 둘 다 한 번에 실행하고 싶을 때
@app.post("/generate-all")
def generate_all():
    run_generate_ai_titles()
    run_issue_analysis()
    return {"status": "success", "message": "titles + issues generated"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)