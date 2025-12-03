# pythonwoker/generateIssueCard/generateIssueCard.py
import os
import json
import time
import logging
import traceback
from datetime import datetime, timedelta

import redis
import requests
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    BigInteger,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Boolean,
    Float,
)
from sqlalchemy.orm import declarative_base, sessionmaker

# ============================================================
# 초기 설정
# ============================================================

logger = logging.getLogger("IssueAI")
logger.setLevel(logging.INFO)
print("[INIT] generateIssueCard.py loaded")

load_dotenv()
DB_URL = os.getenv("DB_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BACKEND_VOTE_URL = os.getenv(
    "BACKEND_VOTE_URL",
    "http://localhost:8080/api/votes/ai-create"
)

client = OpenAI(api_key=OPENAI_API_KEY)

engine = create_engine(DB_URL, echo=False, future=True)
Session = sessionmaker(bind=engine)
session = Session()
Base = declarative_base()

print(f"[INIT] DB_URL={DB_URL}")
print(f"[INIT] BACKEND_VOTE_URL={BACKEND_VOTE_URL}")

# ============================================================
# DB 매핑 (엔티티들)
# ============================================================

class RssArticleEntity(Base):
    __tablename__ = "rss_articles"

    id = Column("article_id", Integer, primary_key=True, autoincrement=True)
    feed_id = Column(Integer, nullable=False)
    title = Column(String(500), nullable=False)
    link = Column(String(500), nullable=False)
    content = Column(Text)
    thumbnail_url = Column(String(500))
    published_at = Column(DateTime)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    view_count = Column(Integer, nullable=False, default=0)
    like_count = Column(Integer, nullable=False, default=0)
    dislike_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    issue_created = Column(Boolean, nullable=False, default=False)
    ai_system_score = Column(Integer, nullable=False, default=0)


class CommunityPostEntity(Base):
    __tablename__ = "community_posts"

    post_id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, nullable=False)
    title = Column(String(255))
    content = Column(Text)
    post_type = Column(String(20))
    recommendation_count = Column(Integer, nullable=False, default=0)
    dislike_count = Column(Integer, nullable=False, default=0)
    comment_count = Column(Integer, nullable=False, default=0)
    ai_system_score = Column(Integer, nullable=False, default=0)
    view_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class IssueEntity(Base):
    __tablename__ = "issues"

    id = Column("issue_id", Integer, primary_key=True, autoincrement=True)
    article_id = Column(Integer, ForeignKey("rss_articles.article_id"))
    community_post_id = Column(BigInteger, ForeignKey("community_posts.post_id"))
    title = Column(String(255), nullable=False)
    thumbnail = Column(String(500))
    content = Column(Text)
    source = Column(String(255))
    ai_summary = Column(Text)
    ai_points = Column(Text)   # JSON 문자열로 저장
    status = Column(String(20), default="PENDING")
    created_by = Column(String(20), default="AI")
    approved_at = Column(DateTime)
    rejected_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


# --- Vote 관련 엔티티 매핑 ------------------------------

class VoteEntity(Base):
    __tablename__ = "Votes"

    id = Column("vote_id", Integer, primary_key=True, autoincrement=True)
    issue_id = Column(Integer, ForeignKey("issues.issue_id"), nullable=False)

    title = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="ONGOING")
    cancellation_reason = Column(String(500))

    total_points = Column(Integer, nullable=False, default=0)
    total_participants = Column(Integer, nullable=False, default=0)

    ai_progress_summary = Column(Text)
    fee_rate = Column(Float, nullable=False, default=0.10)

    end_at = Column(DateTime, nullable=False)

    correct_choice_id = Column(
        BigInteger,
        ForeignKey("Vote_Option_Choices.choice_id"),
        nullable=True
    )
    is_rewarded = Column("is_rewarded", Boolean, default=False)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class VoteOptionEntity(Base):
    __tablename__ = "Vote_Options"

    id = Column("option_id", BigInteger, primary_key=True, autoincrement=True)
    vote_id = Column(Integer, ForeignKey("Votes.vote_id"), nullable=False)

    option_title = Column(String(255), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    is_deleted = Column(Boolean, default=False)


class VoteOptionChoiceEntity(Base):
    __tablename__ = "Vote_Option_Choices"

    id = Column("choice_id", BigInteger, primary_key=True, autoincrement=True)
    option_id = Column(BigInteger, ForeignKey("Vote_Options.option_id"), nullable=False)

    choice_text = Column(String(255), nullable=False)
    points_total = Column(Integer, default=0)
    participants_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    odds = Column(Float)


class VoteRuleEntity(Base):
    __tablename__ = "Vote_Rules"

    id = Column("rule_id", BigInteger, primary_key=True, autoincrement=True)
    vote_id = Column(Integer, ForeignKey("Votes.vote_id"), nullable=False)

    rule_type = Column(String(50), nullable=False)
    rule_description = Column(Text)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


# ============================================================
# 1) Issue 생성 AI
# ============================================================

def generate_issue_card(title, content):
    """기사 제목/내용을 기반으로 Issue + ai_points 생성"""

    prompt = f"""
    아래 기사를 기반으로 Mak'gora 플랫폼의 이슈 카드를 생성하라.

    ⚠️ 출력 규칙:
    - 출력은 반드시 '한 개의' JSON 객체만 포함해야 한다.
    - JSON 바깥에 어떠한 문장도 출력하지 않는다. (설명, 주석, 영어, 불필요한 텍스트 금지)
    - 모든 텍스트는 반드시 한국어로 작성한다.
    - key_points는 기사 내용을 이해하는 데 중요한 핵심 논점을 2~5개 정도로 정리한다.

    기사 제목: {title}
    기사 내용: {content[:2000] if content else title}

    출력(JSON 형식):

    {{
        "issue_title": "이슈 제목(한국어)",
        "issue_summary": "기사 내용을 한 문단으로 핵심 요약한 문장",
        "ai_points": {{
            "key_points": ["핵심1", "핵심2"],
            "importance": "낮음" 또는 "중간" 또는 "높음" 중 하나,
            "vote_type": "YESNO" 또는 "MULTICHOICE" 중 하나
        }}
    }}
    """

    print("[AI] Issue prompt 보내는 중…")

    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    raw = resp.choices[0].message.content.strip()
    print("[AI] Issue RAW:", raw)

    try:
        data = json.loads(raw)
    except Exception:
        print("[ERROR] Issue JSON 파싱 실패 → 기본 fallback 사용")
        data = {
            "issue_title": title,
            "issue_summary": title,
            "ai_points": {
                "key_points": [],
                "importance": "중간",
                "vote_type": "YESNO",
            },
        }

    # ai_points 보정
    ai_points = data.get("ai_points") or {}
    if isinstance(ai_points, str):
        try:
            ai_points = json.loads(ai_points)
        except Exception:
            ai_points = {}

    if not isinstance(ai_points.get("key_points"), list):
        ai_points["key_points"] = []

    if ai_points.get("importance") not in ["낮음", "중간", "높음"]:
        ai_points["importance"] = "중간"

    if ai_points.get("vote_type") not in ["YESNO", "MULTICHOICE"]:
        ai_points["vote_type"] = "YESNO"

    data["ai_points"] = ai_points
    return data


# ============================================================
# 2) Vote 질문 + 옵션 생성 AI (옵션 + result_type)
# ============================================================

def generate_vote_question(issue_title, summary):
    """
    논쟁을 유발하는 예측형 투표 질문과 선택지 생성.
    - options: VoteOption에 들어갈 옵션 제목들
    - result_type:
        - "YES_NO"       → 각 옵션에 YES/NO만 사용
        - "YES_NO_DRAW"  → 각 옵션에 YES/NO/DRAW 사용
    """

    prompt = f"""
    아래 이슈 요약을 기반으로 Mak'gora 플랫폼에서 사용할
    '논쟁형 예측 투표' 구성을 생성하라.

    이 플랫폼에서는 각 옵션에 대해
    - 결과 선택지가 YES/NO 또는 YES/NO/DRAW 두 종류만 존재한다.

    ⚠️ 출력 규칙:
    - 출력은 반드시 하나의 JSON 객체만 포함해야 한다.
    - JSON 바깥에 다른 텍스트(설명, 영어, 주석 등)는 절대 출력하지 않는다.
    - 모든 문장은 반드시 한국어로 작성한다.

    필수 조건:
    - vote_question: 전체 투표를 설명하는 질문 문장 (한국어)
    - options: 유저가 베팅할 대상(옵션) 목록, 2~5개의 한국어 문자열
    - result_type:
        - 무승부 가능성이 거의 없는 경우: "YES_NO"
        - 스포츠 경기, 환율 등 무승부/동률/변동 없음 같은 개념이 의미 있을 경우: "YES_NO_DRAW"

    이슈 요약:
    {summary or issue_title}

    출력(JSON 예시):

    {{
        "vote_question": "향후 1년 내에 이 법안이 폐기될 가능성이 있다고 보십니까?",
        "options": [
            "정부의 개편안이 원안대로 통과된다",
            "국회 논의 과정에서 수정·보완된다"
        ],
        "result_type": "YES_NO"
    }}
    """

    print("[AI] Vote Question 생성 요청…")

    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    raw = resp.choices[0].message.content.strip()
    print("[AI] Vote RAW:", raw)

    try:
        data = json.loads(raw)
    except Exception:
        print("[ERROR] VoteQuestion 파싱 실패 → 기본 값 사용")
        data = {
            "vote_question": issue_title,
            "options": ["시나리오 A가 발생한다", "시나리오 B가 발생한다"],
            "result_type": "YES_NO"
        }

    # options 보정: 2~5개, 문자열 배열
    options = data.get("options")
    if not isinstance(options, list):
        options = ["시나리오 A가 발생한다", "시나리오 B가 발생한다"]

    options = [str(o).strip() for o in options if str(o).strip()]
    if len(options) < 2:
        options = ["시나리오 A가 발생한다", "시나리오 B가 발생한다"]
    if len(options) > 5:
        options = options[:5]

    data["options"] = options

    # result_type 보정
    result_type = data.get("result_type")
    if result_type not in ["YES_NO", "YES_NO_DRAW"]:
        result_type = "YES_NO"
    data["result_type"] = result_type

    return data


# ============================================================
# 3) Vote Rule 생성 AI
# ============================================================

def generate_vote_rule(issue_title, summary):
    """
    기본 룰: 7일 뒤 종료 + 보상 시 10% 수수료 공제
    """

    prompt = f"""
    Mak'gora 투표 규칙을 JSON 형태로 생성하라.

    ⚠️ 출력 규칙:
    - 반드시 한국어만 사용한다.
    - JSON 외의 문장은 절대 출력하지 않는다.

    포함 조건:
    - 투표 종료 시점은 현재 시점 기준 정확히 7일 뒤이다.
    - 승리 보상 지급 시 10% 수수료를 공제한다.

    이슈 요약:
    {summary or issue_title}

    출력(JSON 형식):

    {{
        "rule_type": "BASIC",
        "rule_description": "투표는 7일 뒤 종료되며, 승리 보상 지급 시 10% 수수료가 차감됩니다."
    }}
    """

    print("[AI] Vote Rule 생성 요청…")

    resp = client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw = resp.choices[0].message.content.strip()
    print("[AI] Rule RAW:", raw)

    try:
        data = json.loads(raw)
    except Exception:
        print("[ERROR] Rule 파싱 실패 → 기본 값 사용")
        data = {
            "rule_type": "BASIC",
            "rule_description": "투표는 7일 뒤 종료되며 보상 시 10% 수수료가 공제됩니다.",
        }

    return data


# ============================================================
# Issue 저장
# ============================================================

def save_issue(source, ref, ai):
    """
    RSS / COMMUNITY 공통 Issue 저장
    """

    issue = IssueEntity(
        article_id=getattr(ref, "id", None) if source == "RSS" else None,
        community_post_id=getattr(ref, "post_id", None) if source == "COMMUNITY" else None,
        title=ai["issue_title"],
        content=ref.content,
        thumbnail=getattr(ref, "thumbnail_url", None),
        source=source,
        ai_summary=ai["issue_summary"],
        ai_points=json.dumps(ai["ai_points"], ensure_ascii=False),
        status="PENDING",
        created_by="AI",
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    session.add(issue)
    print(f"[DB] Issue 저장 완료: issue_title={issue.title}")
    return issue


# ============================================================
# Spring Boot로 투표 생성 요청
# ============================================================

def send_vote_to_backend(issue, vote_ai, rule_ai):
    """
    Spring Boot /api/votes/ai-create 로 투표 생성 요청
    VoteEntity.title = Issue.ai_summary (요약문)
    vote_question은 참고용으로만 사용 (DB 저장 X)
    """

    vote_title = issue.ai_summary or issue.title

    print("[INFO] 논쟁형 vote_question (참고용):", vote_ai.get("vote_question"))
    print("[INFO] result_type:", vote_ai.get("result_type"))

    payload = {
        "issueId": issue.id,
        "question": vote_title,  # Spring Boot에서 Vote.title 로 사용
        "options": vote_ai["options"],  # VoteOption.optionTitle 에 매핑
        "resultType": vote_ai.get("result_type", "YES_NO"),  # YES_NO or YES_NO_DRAW
        "endAt": (datetime.now() + timedelta(days=7)).isoformat(),
        "ruleType": rule_ai["rule_type"],
        "ruleDescription": rule_ai["rule_description"],
        "initialStatus": "REVIEWING"  # ← JPA Enum에 맞춤
    }

    print("[POST] 투표 생성요청 payload:", payload)

    try:
        res = requests.post(BACKEND_VOTE_URL, json=payload)
        print("[POST] 상태코드:", res.status_code)
        print("[POST] 응답:", res.text)
    except Exception as e:
        print("[ERROR] 투표 POST 실패:", e)


# ============================================================
# ARTICLE → ISSUE + (AI Vote 1개) 생성
# ============================================================

def run_issue_for_article(article_id):
    """
    1) article_id로 기사 조회
    2) 해당 article_id에 매핑된 Issue가 이미 있으면 재사용
       - 없으면 새 Issue 생성
    3) 해당 Issue에 Vote가 이미 1개 이상 존재하면
       - AI Vote 생성 스킵
    4) 없으면 AI로 Vote 1개 생성 요청
    """

    print(f"\n====== [RUN] ARTICLE ISSUE 생성: article_id={article_id} ======")

    try:
        # 1) 기사 조회
        article = session.query(RssArticleEntity).filter_by(id=article_id).first()
        if not article:
            print("[ERROR] Article 없음")
            return {"status": "error", "message": "article not found"}

        # 2) 기존 Issue 존재 여부 확인
        issue = session.query(IssueEntity).filter_by(article_id=article_id).first()

        if issue:
            print(f"[INFO] article_id={article_id} 에 매핑된 기존 Issue 발견: issue_id={issue.id}")
        else:
            print("[INFO] 기존 Issue 없음 → 새 Issue 생성")
            ai_issue = generate_issue_card(article.title, article.content)
            issue = save_issue("RSS", article, ai_issue)
            session.commit()
            print(f"[SUCCESS] Issue 저장 완료: issue_id={issue.id}")

        # 3) 해당 Issue에 이미 Vote가 있는지 검사 (Issue당 1개만 생성)
        existing_vote = session.query(VoteEntity).filter_by(issue_id=issue.id).first()
        if existing_vote:
            print(f"[INFO] Issue {issue.id} 에 이미 Vote(vote_id={existing_vote.id}) 존재 → AI Vote 생성 스킵")
            return {"status": "ignored_vote_exists", "issueId": issue.id}

        # 4) AI를 이용하여 투표 질문 + 룰 생성
        issue_title_for_vote = issue.title
        issue_summary_for_vote = issue.ai_summary

        vote_ai = generate_vote_question(issue_title_for_vote, issue_summary_for_vote)
        rule_ai = generate_vote_rule(issue_title_for_vote, issue_summary_for_vote)

        # 5) Spring Boot에 투표 생성 요청
        # send_vote_to_backend(issue, vote_ai, rule_ai)
        print("[SKIP] Vote auto-creation disabled (admin approval required)")

        return {"status": "success", "issueId": issue.id}

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "msg": str(e)}


# ============================================================
# COMMUNITY → ISSUE + (AI Vote 1개) 생성
# ============================================================

def run_issue_for_community(post_id):
    """
    1) post_id로 커뮤니티 글 조회
    2) 해당 post_id에 매핑된 Issue 있으면 재사용, 없으면 생성
    3) 해당 Issue에 이미 Vote 있으면 AI Vote 생성 스킵
    4) 없으면 AI로 Vote 1개 생성
    """

    print(f"\n====== [RUN] COMMUNITY ISSUE 생성: post_id={post_id} ======")

    try:
        # 1) 커뮤니티 게시글 조회
        post = session.query(CommunityPostEntity).filter_by(post_id=post_id).first()
        if not post:
            print("[ERROR] Community Post 없음")
            return {"status": "error", "message": "post not found"}

        # 2) 기존 Issue 여부 확인
        issue = session.query(IssueEntity).filter_by(community_post_id=post_id).first()

        if issue:
            print(f"[INFO] post_id={post_id} 에 매핑된 기존 Issue 발견: issue_id={issue.id}")
        else:
            print("[INFO] 기존 Issue 없음 → 새 Issue 생성")
            ai_issue = generate_issue_card(post.title, post.content)
            issue = save_issue("COMMUNITY", post, ai_issue)
            session.commit()
            print(f"[SUCCESS] Issue 생성 완료: issue_id={issue.id}")

        # 3) 해당 Issue에 이미 Vote가 있는지 검사
        existing_vote = session.query(VoteEntity).filter_by(issue_id=issue.id).first()
        if existing_vote:
            print(f"[INFO] Issue {issue.id} 에 이미 Vote(vote_id={existing_vote.id}) 존재 → AI Vote 생성 스킵")
            return {"status": "ignored_vote_exists", "issueId": issue.id}

        # 4) 투표 생성용 AI 호출
        issue_title_for_vote = issue.title
        issue_summary_for_vote = issue.ai_summary

        vote_ai = generate_vote_question(issue_title_for_vote, issue_summary_for_vote)
        rule_ai = generate_vote_rule(issue_title_for_vote, issue_summary_for_vote)

        # 5) Spring Boot에 투표 생성 요청
        # send_vote_to_backend(issue, vote_ai, rule_ai)
        print("[SKIP] Vote auto-creation disabled (admin approval required)")

        return {"status": "success", "issueId": issue.id}

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "msg": str(e)}


# ============================================================
# Redis Queue Worker (ISSUE_TRIGGER_QUEUE)
# ============================================================

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
QUEUE = "ISSUE_TRIGGER_QUEUE"

def worker():
    print("🔄 Issue Queue Worker started. Listening for jobs...")

    while True:
        try:
            raw = r.rpop(QUEUE)

            if raw is None:
                time.sleep(0.3)
                continue

            print(f"📌 Queue Received: {raw}")

            # ARTICLE
            if raw.startswith("article:"):
                article_id = int(raw.split(":")[1])
                print(f"➡ Processing Article Issue: {article_id}")

                result = run_issue_for_article(article_id)
                print("📝 Result:", result)

                if result.get("status") in ["success", "ignored_vote_exists", "ignored"]:
                    r.set(f"article:{article_id}:triggered", "1")

            # COMMUNITY
            elif raw.startswith("cp:"):
                post_id = int(raw.split(":")[1])
                print(f"➡ Processing Community Issue: {post_id}")

                result = run_issue_for_community(post_id)
                print("📝 Result:", result)

                if result.get("status") in ["success", "ignored_vote_exists", "ignored"]:
                    r.set(f"cp:{post_id}:triggered", "1")

        except Exception as e:
            print("❌ Worker Exception:", e)
            traceback.print_exc()
            time.sleep(1)

if __name__ == "__main__":
    worker()
