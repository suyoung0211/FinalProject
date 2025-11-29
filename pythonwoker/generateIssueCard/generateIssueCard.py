# pythonwoker/generateIssueCard/generateIssueCard.py
import os
import json
from datetime import datetime
import logging
import traceback    
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

logger = logging.getLogger(__name__)
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
    title = Column(String(500), nullable=False)
    content = Column(Text)
    thumbnail_url = Column(String(500))
    created_at = Column(DateTime)
    published_at = Column(DateTime)

    # NOT NULL 필드 → default 추가
    view_count = Column(Integer, nullable=False, default=0)
    like_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    ai_system_score = Column(Integer, nullable=False, default=0)

    # bit(1) → Boolean으로 처리
    issue_created = Column(Boolean, nullable=False, default=False)



class CommunityPostEntity(Base):
    __tablename__ = "community_posts"

    post_id = Column(Integer, primary_key=True)
    title = Column(String(255))
    content = Column(Text)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # NOT NULL 필드 → default 추가
    ai_system_score = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    dislike_count = Column(Integer, nullable=False, default=0)
    recommendation_count = Column(Integer, nullable=False, default=0)
    user_id = Column(Integer, nullable=False, default=1)

    view_count = Column(Integer, default=0)

    post_type = Column(String(20))



class IssueEntity(Base):
    __tablename__ = "issues"

    id = Column("issue_id", Integer, primary_key=True, autoincrement=True)

    article_id = Column(Integer, ForeignKey("rss_articles.article_id"), nullable=True)
    community_post_id = Column(Integer, ForeignKey("community_posts.post_id"), nullable=True)

    title = Column(String(255), nullable=False)
    thumbnail = Column(String(255))
    content = Column(Text)
    source = Column(String(255))

    ai_summary = Column(Text)

    # JSON 타입이지만 Python에서는 문자열로 넣어도 MySQL이 JSON으로 처리함
    ai_points = Column(Text)

    # ENUM 값 (Java와 DB ENUM과 100% 일치해야 함)
    status = Column(String(20), default="PENDING")  # APPROVED / PENDING / REJECTED
    created_by = Column(String(20), default="AI")   # ADMIN / AI / SYSTEM / USER

    approved_at = Column(DateTime)
    rejected_at = Column(DateTime)

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
    logger.info(f"[Issue] save_issue called: source={source}")
    issue = IssueEntity(
        article_id=ref.article_id if source == "RSS" else None,
        community_post_id=ref.post_id if source == "COMMUNITY" else None,
        title=ai["issue_title"],
        content=ref.content,
        thumbnail=getattr(ref, "thumbnail_url", None),
        source=source,
        ai_summary=ai["issue_summary"],
        ai_points=json.dumps(ai["key_points"], ensure_ascii=False),
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
    logger.info(f"[Issue] run_issue_for_article called: article_id={article_id}")
    try:
        article = session.query(RssArticleEntity).filter_by(article_id=article_id).first()
        if not article:
            logger.warning(f"[Issue] Article not found: article_id={article_id}")
            return {"status": "error", "message": "article not found"}

        exists = session.query(IssueEntity).filter_by(article_id=article_id).first()
        if exists:
            logger.info(f"[Issue] Issue already exists for article_id={article_id}")
            return {"status": "ignored", "message": "issue already exists"}

        ai = generate_issue_card(article.title, article.content)
        logger.info(f"[Issue] AI generated issue_title={ai.get('issue_title')}")

        save_issue("RSS", article, ai)
        session.commit()

        logger.info(f"[Issue] Article issue saved: articleId={article_id}")
        return {"status": "success", "articleId": article_id}

    except Exception as e:
        logger.error(f"[Issue] Error in run_issue_for_article(article_id={article_id}): {e}")
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "message": str(e)}


# ======================================
# 2) 단일 Community Issue 생성
# ======================================

def run_issue_for_community(post_id):
    logger.info(f"[Issue] run_issue_for_community called: post_id={post_id}")
    try:
        post = session.query(CommunityPostEntity).filter_by(post_id=post_id).first()
        if not post:
            logger.warning(f"[Issue] CommunityPost not found: post_id={post_id}")
            return {"status": "error", "message": "post not found"}

        logger.info(f"[Issue] Found CommunityPost: title={post.title}")

        # 중복 Issue 생성 방지
        exists = session.query(IssueEntity).filter_by(community_post_id=post_id).first()
        if exists:
            logger.info(f"[Issue] Issue already exists for post_id={post_id}")
            return {"status": "ignored", "message": "issue already exists"}

        ai = generate_issue_card(post.title, post.content)
        logger.info(f"[Issue] AI generated issue_title={ai.get('issue_title')}")

        save_issue("COMMUNITY", post, ai)
        session.commit()

        logger.info(f"[Issue] Community issue saved: postId={post_id}")
        return {"status": "success", "postId": post_id}

    except Exception as e:
        logger.error(f"[Issue] Error in run_issue_for_community(post_id={post_id}): {e}")
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "message": str(e)}
