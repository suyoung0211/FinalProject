import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# .env 로드
load_dotenv()
DB_URL = os.getenv("DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ===============================
# DB 세팅
# ===============================
engine = create_engine(DB_URL, echo=False, future=True)
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

# ===============================
# DB 매핑
# ===============================
class RssArticleEntity(Base):
    __tablename__ = "rss_articles"

    article_id = Column(Integer, primary_key=True)
    title = Column(String(500))
    content = Column(Text)
    thumbnail_url = Column(String(500))
    created_at = Column(DateTime)


class IssueEntity(Base):
    __tablename__ = "issues"

    id = Column("issue_id", Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"))
    community_post_id = Column(Integer, nullable=True)

    title = Column(String(255), nullable=False)
    thumbnail = Column(String(500))
    content = Column(Text)
    source = Column(String(255))
    ai_summary = Column(Text)

    ai_points = Column(Text)   # JSON 문자열 저장

    status = Column(String(20), default="PENDING")
    created_by = Column(String(20), default="AI")

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    article = relationship("RssArticleEntity")

# ===============================
# OpenAI 클라이언트
# ===============================
client = OpenAI(api_key=OPENAI_API_KEY)

# ===============================
# Issue 생성 AI 함수 (JSON 안전 처리 포함)
# ===============================
def generate_issue_card(title, content):
    content_text = content or title

    prompt = f"""
    아래 뉴스 기사를 기반으로 Mak'gora의 Issue 카드를 생성하라.

    반드시 JSON만 출력하고 설명 문장을 절대 쓰지 마라.

    기사 제목: {title}
    내용: {content_text[:2000]}

    출력(JSON):
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
        max_tokens=300,
        temperature=0.7,
    )

    raw = res.choices[0].message.content.strip()

    print("\n🔵 GPT 응답 RAW:")
    print(raw)
    print("===============================================")

    # JSON 파싱 오류 방지
    try:
        ai_json = json.loads(raw)
    except Exception as e:
        print("❌ JSON 파싱 오류 발생:", e)
        print("⚠️ 원본 GPT 출력:", raw)

        # 기본값으로 fallback
        return {
            "issue_title": title,
            "issue_summary": "",
            "key_points": [],
            "importance": "중간",
            "vote_type": "YESNO"
        }

    # key_points가 문자열로 올 경우 다시 파싱
    kp = ai_json.get("key_points", [])
    if isinstance(kp, str):
        try:
            kp = json.loads(kp)
        except:
            kp = []
    ai_json["key_points"] = kp

    return ai_json

# ===============================
# Issue INSERT
# ===============================
def save_issue_to_db(article, ai):
    issue = IssueEntity(
        article_id=article.article_id,
        community_post_id=None,
        title=ai["issue_title"],
        thumbnail=article.thumbnail_url,
        content=article.content or "",
        source="RSS",
        ai_summary=ai["issue_summary"],
        ai_points=json.dumps(ai["key_points"]),
        status="APPROVED",
        created_by="AI",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    session.add(issue)
    print(f"🟢 Issue 생성됨 → article_id: {article.article_id}, title: {ai['issue_title']}")

# ===============================
# 전체 Issue 생성 실행 함수
# ===============================
def run_issue_analysis():
    print("\n🚀 Issue 생성 시작...")

    articles = session.query(RssArticleEntity).all()
    print(f"📌 총 RSS 기사 수: {len(articles)}")

    count_new = 0

    for article in articles:
        exists = (
            session.query(IssueEntity)
            .filter_by(article_id=article.article_id)
            .first()
        )
        if exists:
            continue

        print(f"\n📝 기사 처리중: {article.article_id} - {article.title[:30]}...")

        ai = generate_issue_card(article.title, article.content)
        save_issue_to_db(article, ai)
        count_new += 1

    session.commit()

    print(f"\n🎉 AI Issue 생성 완료! 새로 생성된 Issue 수: {count_new}")
