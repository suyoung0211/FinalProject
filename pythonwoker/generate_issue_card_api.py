from fastapi import FastAPI
from generateIssueCard.generateIssueCard import run_issue_analysis
import uvicorn

app = FastAPI()

@app.post("/generate-issue-cards")
def generate_issue_cards():
    try:
        run_issue_analysis()
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)
