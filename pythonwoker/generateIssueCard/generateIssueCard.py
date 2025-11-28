# pythonwoker/generateIssueCard/generateIssueCard.py
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

load_dotenv()
DB_URL = os.getenv("DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

engine = create_engine(DB_URL, echo=False, future=True)
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

# ======================================
# DB 매핑
# ======================================

class RssArticleEntity(Base):
    __tablename__ = "rss_articles"

    article_id = Column(Integer, primary_key=True)
    title = Column(String(500))
    content = Column(Text)
    thumbnail_url = Column(String(500))
    created_at = Column(DateTime)

    # 실제 DB 구조에 맞춰 추가 (옵션)
    view_count = Column("view_count", Integer, nullable=True)
    like_count = Column("like_count", Integer, nullable=True)
    comment_count = Column("comment_count", Integer, nullable=True)
    ai_system_score = Column("ai_system_score", Integer, nullable=True)
    issue_created = Column("issue_created", Boolean, nullable=True)


class CommunityPostEntity(Base):
    __tablename__ = "community_posts"

    post_id = Column(Integer, primary_key=True)
    title = Column(String(255))
    content = Column(Text)
    created_at = Column(DateTime)

    # 필요시 확장
    view_count = Column("view_count", Integer, nullable=True)
    recommendation_count = Column("recommendation_count", Integer, nullable=True)
    dislike_count = Column("dislike_count", Integer, nullable=True)
    comment_count = Column("comment_count", Integer, nullable=True)
    ai_system_score = Column("ai_system_score", Integer, nullable=True)


class IssueEntity(Base):
    __tablename__ = "issues"

    id = Column("issue_id", Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"))
    community_post_id = Column(Integer, ForeignKey("community_posts.post_id"))

    title = Column(String(255), nullable=False)
    thumbnail = Column(String(500))
    content = Column(Text)
    source = Column(String(255))
    ai_summary = Column(Text)
    ai_points = Column(Text)

    status = Column(String(20), default="PENDING")
    created_by = Column(String(20), default="AI")

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

# ======================================
# OpenAI Client
# ======================================

client = OpenAI(api_key=OPENAI_API_KEY)

# ======================================
# Issue 생성 AI
# ======================================

def generate_issue_card(title, content):
    content_text = content or title

    prompt = f"""
    아래 내용을 기반으로 Mak'gora Issue 카드를 생성하라.
    반드시 JSON만 출력하고, 설명 문장은 절대 쓰지 마라.

    제목: {title}
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

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.7,
    )

    raw = response.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
    except:
        data = {
            "issue_title": title,
            "issue_summary": "",
            "key_points": [],
            "importance": "중간",
            "vote_type": "YESNO"
        }

    # key_points가 문자열로 올 경우 방어
    kp = data.get("key_points", [])
    if isinstance(kp, str):
        try:
            kp = json.loads(kp)
        except:
            kp = []
    data["key_points"] = kp

    return data

# ======================================
# 공통 Issue 저장 함수
# ======================================

def save_issue(source, ref, ai):
    issue = IssueEntity(
        article_id=ref.article_id if source == "RSS" else None,
        community_post_id=ref.post_id if source == "COMMUNITY" else None,
        title=ai["issue_title"],
        content=ref.content,
        thumbnail=getattr(ref, "thumbnail_url", None),
        source=source,
        ai_summary=ai["issue_summary"],
        ai_points=json.dumps(ai["key_points"]),
        status="APPROVED",
        created_by="AI",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    session.add(issue)
    return issue

# ======================================
# 1) 단일 Article Issue 생성
# ======================================

def run_issue_for_article(article_id):
    article = session.query(RssArticleEntity).filter_by(article_id=article_id).first()
    if not article:
        return {"status": "error", "message": "article not found"}

    # 중복 Issue 생성 방지
    exists = session.query(IssueEntity).filter_by(article_id=article_id).first()
    if exists:
        return {"status": "ignored", "message": "issue already exists"}

    ai = generate_issue_card(article.title, article.content)
    save_issue("RSS", article, ai)
    session.commit()

    return {"status": "success", "articleId": article_id}

# ======================================
# 2) 단일 Community Issue 생성
# ======================================

def run_issue_for_community(post_id):
    post = session.query(CommunityPostEntity).filter_by(post_id=post_id).first()
    if not post:
        return {"status": "error", "message": "post not found"}

    # 중복 Issue 생성 방지
    exists = session.query(IssueEntity).filter_by(community_post_id=post_id).first()
    if exists:
        return {"status": "ignored", "message": "issue already exists"}

    ai = generate_issue_card(post.title, post.content)
    save_issue("COMMUNITY", post, ai)
    session.commit()

    return {"status": "success", "postId": post_id}
