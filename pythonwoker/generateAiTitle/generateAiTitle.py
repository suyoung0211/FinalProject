# generateAiTitle/generateAiTitle.py

import os
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
    feed_id = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    link = Column(Text, unique=True, nullable=False)
    content = Column(Text)
    thumbnail_url = Column(String(500))
    published_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)


class ArticleAiTitleEntity(Base):
    __tablename__ = "article_ai_titles"

    ai_title_id = Column(Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"), unique=True)
    article = relationship("RssArticleEntity")
    ai_title = Column(Text)
    model_name = Column(String(100))
    status = Column(String(20), nullable=False)
    try_count = Column(Integer, nullable=False, default=0)
    last_error = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    last_success_at = Column(DateTime)

# ===============================
# OpenAI 클라이언트
# ===============================
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_ai_title(title, content):
    prompt = f"다음 뉴스 제목과 내용을 보고, 누구나 한번은 클릭하고 싶게 흥미로운 제목을 만들어줘.\n제목: {title}\n내용: {content}"
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=1.5,
        max_tokens=60
    )
    return response.choices[0].message.content.strip()

# ===============================
# AI 제목 생성 실행 함수 (제목 없는 경우만 생성)
# ===============================
def run_generate_ai_titles():
    articles = session.query(RssArticleEntity).filter(RssArticleEntity.is_deleted == False).all()
    
    for article in articles:
        existing = session.query(ArticleAiTitleEntity).filter_by(article_id=article.article_id).first()

        # 기존 AI 제목이 없거나 비어있을 때만 생성
        if not existing or not existing.ai_title:
            try:
                content_for_prompt = article.content if article.content else article.title
                ai_title_text = generate_ai_title(article.title, content_for_prompt)
                status = "SUCCESS"
                last_success_at = datetime.now()
                last_error = None
            except Exception as e:
                ai_title_text = None
                status = "FAILED"
                last_error = str(e)
                last_success_at = None

            if existing:
                existing.ai_title = ai_title_text
                existing.status = status
                existing.last_error = last_error
                existing.last_success_at = last_success_at
                existing.updated_at = datetime.now()
                existing.try_count += 1
            else:
                new_ai_title = ArticleAiTitleEntity(
                    article_id=article.article_id,
                    ai_title=ai_title_text,
                    model_name="gpt-4.1-mini",
                    status=status,
                    try_count=1,
                    last_error=last_error,
                    last_success_at=last_success_at
                )
                session.add(new_ai_title)

    session.commit()
    print("AI 제목 생성 완료")