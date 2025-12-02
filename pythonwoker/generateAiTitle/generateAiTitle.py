# generateAiTitle/generateAiTitle.py

import os
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# ===============================
# 환경변수 로드
# ===============================
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
# DB 매핑 클래스
# ===============================
class RssArticleEntity(Base):
    __tablename__ = "rss_articles"

    article_id = Column(Integer, primary_key=True, autoincrement=True)

    ai_system_score = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    dislike_count = Column(Integer, nullable=False, default=0)
    feed_id = Column(Integer, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    issue_created = Column(Boolean, nullable=False, default=False)
    like_count = Column(Integer, nullable=False, default=0)
    view_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    published_at = Column(DateTime)

    link = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    title = Column(String(500), nullable=False)
    content = Column(Text)


class ArticleAiTitleEntity(Base):
    __tablename__ = "article_ai_titles"

    ai_title_id = Column(Integer, primary_key=True, autoincrement=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"), nullable=False, unique=True)

    try_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.now)
    last_success_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    status = Column(String(20), nullable=False)
    model_name = Column(String(100))
    last_error = Column(Text)
    ai_title = Column(Text)

    article = relationship("RssArticleEntity")


# ===============================
# OpenAI 클라이언트
# ===============================
client = OpenAI(api_key=OPENAI_API_KEY)


def generate_ai_title(title, content):
    """
    주어진 제목과 내용으로 AI 제목 생성
    """
    prompt = f"""
        다음 뉴스 제목과 내용을 보고 클릭하고 싶은 매력적인 제목을 만들어 주세요.
        - 제목 길이: 반드시 50자 이내로 작성
        - 궁금증을 유발하는 제목
        - 핵심 키워드 포함
        - 응답은 제목 텍스트만 반환

        기사 제목: {title}
        기사 내용: {content}
    """

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=1.5,
        max_tokens=60,
    )

    return response.choices[0].message.content.strip()


# ===============================
# AI 제목 생성 실행 함수
# ===============================
MAX_TRY = 3
MAX_TITLE_LENGTH = 50


def run_generate_ai_titles():
    articles = session.query(RssArticleEntity).filter(RssArticleEntity.is_deleted == False).all()
    result_summary = []

    for article in articles:
        article_result = {"article_id": article.article_id, "status": None, "error": None}

        try:
            existing = session.query(ArticleAiTitleEntity).filter_by(article_id=article.article_id).first()

            # 🔥 existing None 체크 필수
            if existing is not None:
                # 최대 시도 초과
                if existing.try_count >= MAX_TRY:
                    article_result["status"] = "SKIPPED_MAX_TRY"
                    result_summary.append(article_result)
                    continue

                # 이미 AI 제목 존재 (SUCCESS)
                if existing.ai_title and existing.status == "SUCCESS":
                    article_result["status"] = "ALREADY_EXISTS"
                    result_summary.append(article_result)
                    continue

            # AI 제목 생성 시도
            try:
                content_for_prompt = article.content if article.content else article.title
                ai_title_text = generate_ai_title(article.title, content_for_prompt)

                if len(ai_title_text) > MAX_TITLE_LENGTH:
                    raise ValueError(f"AI 제목 길이 초과: {len(ai_title_text)}자")

                status = "SUCCESS"
                last_success_at = datetime.now()
                last_error = None

            except Exception as e:
                ai_title_text = None
                status = "FAILED"
                last_error = str(e)
                last_success_at = None

            # DB 저장 또는 업데이트
            if existing:
                existing.ai_title = ai_title_text
                existing.status = status
                existing.last_error = last_error
                existing.last_success_at = last_success_at
                existing.try_count += 1
                existing.updated_at = datetime.now()
                session.add(existing)
            else:
                new_ai_title = ArticleAiTitleEntity(
                    article_id=article.article_id,
                    ai_title=ai_title_text,
                    model_name="gpt-4.1",
                    status=status,
                    try_count=1,
                    last_error=last_error,
                    last_success_at=last_success_at,
                )
                session.add(new_ai_title)

            # 커밋 처리
            try:
                session.commit()
            except Exception as db_e:
                session.rollback()

                error_msg = f"{last_error or ''} | DB ERROR: {db_e}"

                if existing:
                    existing.status = "DB_COMMIT_FAILED"
                    existing.last_error = error_msg
                    existing.updated_at = datetime.now()
                    session.add(existing)
                else:
                    new_ai_title.status = "DB_COMMIT_FAILED"
                    new_ai_title.last_error = error_msg
                    session.add(new_ai_title)

                session.commit()
                article_result["status"] = "DB_COMMIT_FAILED"
                article_result["error"] = error_msg
                result_summary.append(article_result)
                continue

            # 성공
            article_result["status"] = status
            article_result["error"] = last_error
            result_summary.append(article_result)

        except Exception as outer_e:
            session.rollback()
            article_result["status"] = "PROCESS_ERROR"
            article_result["error"] = str(outer_e)
            result_summary.append(article_result)
            print(f"[PROCESS ERROR] article_id={article.article_id}: {outer_e}")

    print("AI 제목 생성 완료")
    return result_summary
