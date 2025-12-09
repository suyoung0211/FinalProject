# generateAiTitle/generateAiTitle.py

import os
from datetime import datetime
from collections import Counter
import logging

from fastapi import FastAPI
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from dotenv import load_dotenv
from openai import OpenAI


# ===============================
# 환경변수 로드
# ===============================
load_dotenv()
DB_URL = os.getenv("MYSQL_PUBLIC_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# ===============================
# 로깅 세팅
# ===============================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===============================
# DB 세팅
# ===============================
engine = create_engine(DB_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)    # 세션이 실행 시점으로 저장됨
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

# ===============================
# AI 제목 생성 함수
# ===============================
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

# 🔹 AI 제목 생성 메인 로직
def run_generate_ai_titles():
    """RSS 기사 기반 AI 제목 생성 수행 및 결과 요약 반환"""

    session = SessionLocal()  # 항상 새 세션으로 갱신

    # 🔹 삭제되지 않은 기사만 조회
    articles = session.query(RssArticleEntity).filter(RssArticleEntity.is_deleted == False).all()
    
    # 🔹 성공/실패/스킵 카운트 저장
    summary = {"success_count": 0, "failed_count": 0, "skipped_count": 0}

    # 🔹 실패 사유 텍스트만 모으는 리스트 (개별 ID 제외)
    failed_logs = []

    for article in articles:
        try:
            # 🔹 기존 AI 제목 정보 조회
            existing = (
                session.query(ArticleAiTitleEntity)
                .filter_by(article_id=article.article_id)
                .first()
            )

            # 🔹 최대 시도 초과
            if existing and existing.try_count >= MAX_TRY:
                summary["skipped_count"] += 1
                continue

            # 🔹 이미 성공적으로 만들어진 상태라면 스킵
            if existing and existing.ai_title and existing.status == "SUCCESS":
                summary["skipped_count"] += 1
                continue

            # 🔹 AI 제목 생성 시도
            content_for_prompt = article.content if article.content else article.title

            try:
                # AI 호출
                ai_title_text = generate_ai_title(article.title, content_for_prompt)

                # 길이 검증
                if len(ai_title_text) > MAX_TITLE_LENGTH:
                    raise ValueError("AI 제목 길이 초과")

                status = "SUCCESS"
                last_success_at = datetime.now()
                last_error = None
                summary["success_count"] += 1

            except Exception as e:
                # 🔹 AI 생성 실패
                ai_title_text = None
                status = "FAILED"
                last_error = str(e)
                last_success_at = None
                summary["failed_count"] += 1

                failed_logs.append(last_error)  # 실패 사유 기록

                print(f"[AI FAILED] article_id={article.article_id} | error={last_error}")

            # 🔹 DB에 저장 혹은 업데이트
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

            # 🔹 커밋 처리
            try:
                session.commit()
            except Exception as db_e:
                # 🔹 DB 저장 실패
                session.rollback()

                db_error_msg = f"DB ERROR: {db_e}"
                failed_logs.append(db_error_msg)
                summary["failed_count"] += 1

                print(f"[DB COMMIT FAILED] article_id={article.article_id} | error={db_error_msg}")

                # DB 실패도 저장
                if existing:
                    existing.status = "DB_COMMIT_FAILED"
                    existing.last_error = db_error_msg
                    existing.updated_at = datetime.now()
                    session.add(existing)
                else:
                    new_ai_title.status = "DB_COMMIT_FAILED"
                    new_ai_title.last_error = db_error_msg
                    session.add(new_ai_title)

                session.commit()

        except Exception as outer_e:
            # 🔹 기타 처리 중 오류
            session.rollback()

            error_msg = f"PROCESS ERROR: {str(outer_e)}"
            failed_logs.append(error_msg)
            summary["failed_count"] += 1
            print(error_msg)

    print("AI 제목 생성 완료")

    # 🔥 실패 사유별 집계
    error_counter = Counter(failed_logs)

    failed_summary = [
        {"reason": reason, "count": count}
        for reason, count in error_counter.items()
    ]

    # 🔹 API에서 바로 사용 가능한 응답 구조
    return {
        "status": "completed",
        "summary": summary,
        "failed_summary": failed_summary
    }

# ===============================
# FastAPI 서버
# ===============================
app = FastAPI()

@app.post("/generate-ai-titles")
def generate_ai_titles_api():
    result_data = run_generate_ai_titles()
    summary = result_data.get("summary", {})
    failed_summary = result_data.get("failed_summary", [])

    success_count = summary.get("success_count", 0)
    failed_count = summary.get("failed_count", 0)
    skipped_count = summary.get("skipped_count", 0)

    failed_articles = [{"reason": f["reason"], "count": f["count"]} for f in failed_summary]

    logger.info(f"AI 제목 생성 완료: SUCCESS={success_count}, FAILED={failed_count}, SKIPPED={skipped_count}")
    for f in failed_articles:
        logger.error(f"[FAILED] reason={f['reason']} count={f['count']}")

    return {
        "status": "completed",
        "message": "AI 제목 생성 완료",
        "summary": {
            "success_count": success_count,
            "failed_count": failed_count,
            "skipped_count": skipped_count,
        },
        "failed_articles": failed_articles,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)