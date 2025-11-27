import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# .env 로드
load_dotenv()
DB_URL = os.getenv("DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# DB 세팅
engine = create_engine(DB_URL, echo=False, future=True)
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

# ===============================
# DB 매핑 클래스
# ===============================
class RssArticleEntity(Base):
    __tablename__ = "rss_articles"

    article_id = Column(Integer, primary_key=True)
    title = Column(String(500))
    content = Column(Text)
    thumbnail_url = Column(String(500))
    created_at = Column(DateTime)

class IssueAiAnalysisEntity(Base):
    __tablename__ = "issue_ai_analysis"

    id = Column(Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"), unique=True)
    article = relationship("RssArticleEntity")

    issue_title = Column(String(500))
    issue_summary = Column(Text)
    key_points = Column(Text)  # JSON 문자열
    importance = Column(String(50))
    model_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


# ===============================
# OpenAI 클라이언트
# ===============================
client = OpenAI(api_key=OPENAI_API_KEY)

# ===============================
# Issue 분석 함수
# ===============================
def generate_issue_card(title, content):
    prompt = f"""
    아래 뉴스 기사를 기반으로 Mak'gora 플랫폼의 ISSUE 카드를 생성하라.

    ① 핵심 쟁점을 요약한 이슈 제목 (20자 내외)
    ② 요약 설명 (3~5문장)
    ③ 핵심 포인트 3~5개 (JSON 리스트)
    ④ 중요도: 낮음/중간/높음 중 하나
    ⑤ 추천 투표 방식: YESNO 또는 MULTI
    
    기사 제목: {title}
    내용: {content[:2000]}

    출력 형식(JSON):
    {{
        "issue_title": "",
        "issue_summary": "",
        "key_points": [],
        "importance": "",
        "vote_type": ""
    }}
    """

    res = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.7,
    )

    return json.loads(res.choices[0].message["content"])

# ===============================
# 자동 Issue 생성 실행 함수
# ===============================
def run_issue_analysis():
    articles = session.query(RssArticleEntity).all()

    for article in articles:
        existing = (
            session.query(IssueAiAnalysisEntity)
            .filter_by(article_id=article.article_id)
            .first()
        )

        if existing:
            continue  # 이미 분석함

        ai = generate_issue_card(article.title, article.content)

        analysis = IssueAiAnalysisEntity(
            article_id=article.article_id,
            issue_title=ai["issue_title"],
            issue_summary=ai["issue_summary"],
            key_points=json.dumps(ai["key_points"]),
            importance=ai["importance"],
            model_name="gpt-4.1",
        )

        session.add(analysis)

    session.commit()
    print("AI Issue 카드 생성 완료.")
