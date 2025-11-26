# generate_ai_titles_api.py

from fastapi import FastAPI
from generateAiTitle.generateAiTitle import run_generate_ai_titles  # 패키지 import
import uvicorn

app = FastAPI()

@app.post("/generate-ai-titles")
def generate_ai_titles_endpoint():
    try:
        run_generate_ai_titles()
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)