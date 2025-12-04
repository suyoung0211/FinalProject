# pythonworker/generateIssueCard/generateIssueCard.py
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
# DB 엔티티 매핑
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

    post_id = Column("post_id", BigInteger, primary_key=True)
    user_id = Column("user_id", BigInteger, nullable=False)

    title = Column("title", String(255))
    content = Column("content", Text)
    post_type = Column("post_type", String(20))

    view_count = Column("view_count", Integer)
    recommendation_count = Column("recommendation_count", Integer)
    dislike_count = Column("dislike_count", Integer)
    comment_count = Column("comment_count", Integer)

    ai_system_score = Column("ai_system_score", Integer, nullable=False)

    created_at = Column("created_at", DateTime, nullable=False)
    updated_at = Column("updated_at", DateTime, nullable=False)


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
    ai_points = Column(Text)

    # 🔥 누락된 부분 추가!
    status = Column(String(20), default="PENDING")

    created_by = Column(String(20), default="AI")

    approved_at = Column(DateTime)
    rejected_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

# --- Vote 관련 엔티티 -----------------------------

class VoteEntity(Base):
    __tablename__ = "Votes"

    id = Column("vote_id", Integer, primary_key=True, autoincrement=True)
    issue_id = Column(Integer, ForeignKey("issues.issue_id"), nullable=False)

    title = Column(String(255), nullable=False)
    # REVIEWING / ONGOING / FINISHED 등 Enum과 매핑 (Java 쪽)
    status = Column(String(20), nullable=False, default="REVIEWING")
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
    is_rewarded = Column(Boolean, default=False)

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
# 1) AI — Issue 카드 생성 프롬프트
# ============================================================

def generate_issue_card(title, content):
    """
    기사 제목/내용을 기반으로 Mak'gora 이슈 카드(제목, 요약, ai_points)를 생성.
    - JSON 1개만 출력
    - 한국어만 사용
    - ai_points: { key_points, importance, vote_type }
    """

    prompt = f"""
아래 기사를 기반으로 Mak'gora 플랫폼의 "이슈 카드"를 생성하라.

⚠ 출력 규칙 (아주 중요):
- 출력은 반드시 '한 개의' JSON 객체만 포함해야 한다.
- JSON 바깥에는 어떤 텍스트도 출력하지 않는다. (설명, 주석, 예시, 영어, 불필요한 텍스트 모두 금지)
- 모든 텍스트는 반드시 한국어로 작성한다.
- key_points는 기사 내용을 이해하는 데 중요한 핵심 논점을 2~5개 정도로 정리한다.

기사 제목: {title}
기사 내용: {content[:2000] if content else title}

출력 형식(JSON만):

{{
  "issue_title": "이슈 제목(한국어)",
  "issue_summary": "기사 전체 내용을 한 문단으로 핵심 요약한 문장",
  "ai_points": {{
    "key_points": [
      "핵심 논점 1",
      "핵심 논점 2"
    ],
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
# 2) AI — Vote 질문 + 옵션 생성 프롬프트
# ============================================================

def generate_vote_question(issue_title, summary):
    """
    논쟁형 예측 투표 질문과 옵션 생성.
    - options: 2~5개, 문자열
    - result_type:
        - "YES_NO"       → 각 옵션에 YES / NO
        - "YES_NO_DRAW"  → 각 옵션에 YES / NO / DRAW
    """

    prompt = f"""
아래 이슈 요약을 기반으로 Mak'gora 플랫폼에서 사용할
"논쟁형 예측 투표" 구성을 생성하라.

이 플랫폼에서는 각 옵션(option)에 대해 결과 선택지는 아래 두 패턴 중 하나만 허용된다:
  1) YES / NO
  2) YES / NO / DRAW   ← *DRAW는 반드시 필요한 경우에만 사용*

⚠ 핵심 규칙:
- 출력은 반드시 'JSON 한 개'만 포함해야 한다.
- JSON 외의 설명글, 해설, 문장, 영어는 절대 포함하지 말 것.
- 모든 내용은 한국어로 작성하라.

⚠ 옵션 규칙:
- options 배열은 반드시 1~5개의 "베팅 대상" 문자열이어야 하며,
  각 요소는 베팅 가능한 선택지(시나리오, 주장, 팀, 후보 등)이다.
- 특정 옵션이 “무승부” 개념을 가질 수 없는 경우(result_type은 YES_NO)
  → DRAW 를 절대 포함하지 말 것.
- 무승부 개념이 **실제로 의미 있을 때만** (스포츠 경기/지표 동률/선거 동률 등)
  → result_type 을 "YES_NO_DRAW" 로 설정할 수 있다.
- 그 외 대부분의 정책·이슈·사건 예측은 기본적으로 YES_NO 를 우선 사용한다.

⚠ 필수 JSON 구조:
{{
  "vote_question": "투표 질문 문장",
  "options": ["옵션1", "옵션2", ... 1~5개],
  "result_type": "YES_NO" 또는 "YES_NO_DRAW"
}}

이슈 요약:
{summary or issue_title}

출력 예시(참고용, 그대로 쓰지 말 것):

{{
  "vote_question": "향후 1년 내에 이 법안이 폐기될 가능성이 있다고 보십니까?",
  "options": ["정부의 개편안이 통과된다", "국회 논의 과정에서 수정·보완된다"],
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
    if len(options) < 1:
        options = ["시나리오 A가 발생한다", "시나리오 B가 발생한다"]
    if len(options) > 5:
        options = options[:5]

    data["options"] = options

    # result_type 보정
    result_type = data.get("result_type")
    if result_type not in ["YES_NO", "YES_NO_DRAW"]:
        result_type = "YES_NO"
    data["result_type"] = result_type

    # ============================================
    # 🔥 DRAW 자동 제거 로직
    # YES_NO 인데 result_type을 잘못 줬을 경우 → DRAW 제거
    # ============================================
    if data["result_type"] == "YES_NO":
        # 시나리오: AI가 YES_NO 라고 하면서 "DRAW" 옵션을 넣은 경우 → 제거
        data["options"] = [
            opt.replace("DRAW", "").strip()
            for opt in data["options"]
        ]

    return data


# ============================================================
# 3) AI — Vote Rule 생성 프롬프트
# ============================================================

def generate_vote_rule(issue_title, summary):
    """
    기본 룰: 7일 뒤 종료 + 보상 시 10% 수수료 공제
    """

    prompt = f"""
Mak'gora 투표 규칙을 JSON 형태로 생성하라.

⚠ 출력 규칙:
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
# Issue 저장 (RSS / COMMUNITY 공통)
# ============================================================

def save_issue(source, ref, ai):
    """
    source: "RSS" 또는 "COMMUNITY"
    ref   : RssArticleEntity 또는 CommunityPostEntity
    ai    : generate_issue_card 결과(JSON dict)
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
    session.commit()          # DB에 flush → PK 생성
    session.refresh(issue)    # issue.id 값을 세션으로 다시 가져오기
    print(f"[DB] Issue 저장 완료: issue_title={issue.title}")
    return issue


# ============================================================
# Spring Boot로 Vote 생성 요청
# ============================================================

def send_vote_to_backend(issue, vote_ai, rule_ai):
    """
    Spring Boot /api/votes/ai-create 로 투표 생성 요청.
    실제 DB 저장(Votes, Vote_Options, Vote_Option_Choices, Vote_Rules)
    은 전부 Spring Boot가 처리한다.
    """

    vote_title = issue.ai_summary or issue.title

    print("[INFO] 논쟁형 vote_question (참고용):", vote_ai.get("vote_question"))
    print("[INFO] result_type:", vote_ai.get("result_type"))

    # ---------------------------------------------------------
    # ✅ 여기서 option_dtos 생성해야 한다 (payload보다 반드시 위!)
    # ---------------------------------------------------------
    option_dtos = []
    include_draw = (vote_ai["result_type"] == "YES_NO_DRAW")

    for opt in vote_ai["options"]:
        choices = ["YES", "NO"]
        if include_draw:
            choices.append("DRAW")

        option_dtos.append({
            "title": opt,
            "choices": choices
        })
    # ---------------------------------------------------------

    # 이제 payload 생성
    payload = {
        "issueId": issue.id,
        "question": issue.ai_summary,
        "options": option_dtos,
        "resultType": vote_ai["result_type"],
        "endAt": (datetime.now() + timedelta(days=7)).isoformat(),
        "ruleType": rule_ai["rule_type"],
        "ruleDescription": rule_ai["rule_description"],
        "initialStatus": "REVIEWING"
    }

    print("[POST] 투표 생성요청 payload:", json.dumps(payload, ensure_ascii=False, indent=2))

    try:
        res = requests.post(BACKEND_VOTE_URL, json=payload)
        print("[POST] 상태코드:", res.status_code)
        print("[POST] 응답:", res.text)
    except Exception as e:
        print("[ERROR] 투표 POST 실패:", e)


# ============================================================
# ARTICLE → ISSUE 생성
# ============================================================

def run_issue_for_article(session, article_id):
    """
    1) article_id로 기사 조회
    2) 해당 article_id에 매핑된 Issue가 이미 있으면 재사용
       - 없으면 새 Issue 생성
    """

    print(f"\n====== [RUN] ARTICLE ISSUE 생성: article_id={article_id} ======")

    try:
        article = session.query(RssArticleEntity).filter_by(id=article_id).first()
        if not article:
            print("[ERROR] Article 없음")
            return {"status": "error", "message": "article not found"}

        issue = session.query(IssueEntity).filter_by(article_id=article_id).first()

        if issue:
            print(f"[INFO] article_id={article_id} 에 매핑된 기존 Issue 발견: issue_id={issue.id}")
        else:
            print("[INFO] 기존 Issue 없음 → 새 Issue 생성")
            ai_issue = generate_issue_card(article.title, article.content)
            issue = save_issue("RSS", article, ai_issue)
            session.commit()
            print(f"[SUCCESS] Issue 저장 완료: issue_id={issue.id}")

        return {"status": "success", "issueId": issue.id}

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "msg": str(e)}


# ============================================================
# COMMUNITY → ISSUE 생성
# ============================================================

def run_issue_for_community(session, post_id):
    
    """
    1) post_id로 커뮤니티 글 조회
    2) 해당 post_id에 매핑된 Issue 있으면 재사용, 없으면 생성
    """

    print(f"\n====== [RUN] COMMUNITY ISSUE 생성: post_id={post_id} ======")

    try:
        post = session.query(CommunityPostEntity).filter_by(post_id=post_id).first()
        print("[DEBUG] Query Result:", post)
        if not post:
            print("[ERROR] Community Post 없음")
            return {"status": "error", "message": "post not found"}

        issue = session.query(IssueEntity).filter_by(community_post_id=post_id).first()

        if issue:
            print(f"[INFO] post_id={post_id} 에 매핑된 기존 Issue 발견: issue_id={issue.id}")
        else:
            print("[INFO] 기존 Issue 없음 → 새 Issue 생성")
            ai_issue = generate_issue_card(post.title, post.content)
            issue = save_issue("COMMUNITY", post, ai_issue)
            session.commit()
            print(f"[SUCCESS] Issue 생성 완료: issue_id={issue.id}")

        return {"status": "success", "issueId": issue.id}

    except Exception as e:
        traceback.print_exc()
        session.rollback()
        return {"status": "error", "msg": str(e)}


# ============================================================
# ISSUE 승인 → Vote 생성
#  - Java에서 Issue 상태를 APPROVED 로 바꾼 다음
#    Redis 큐에 "issueApprove:{id}" 형태로 푸시한다고 가정.
# ============================================================

def run_vote_for_issue(session, issue_id):
    print(f"\n====== [RUN] ISSUE → VOTE 생성: issue_id={issue_id} ======")

    try:
        issue = session.query(IssueEntity).filter_by(id=issue_id).first()
        if not issue:
            print("[ERROR] Issue 없음")
            return {"status": "error", "msg": "issue not found"}

        # 이미 Vote 존재하는지 검사 (Issue당 1개만)
        existing_vote = session.query(VoteEntity).filter_by(issue_id=issue_id).first()
        if existing_vote:
            print(f"[INFO] Issue {issue_id} 에 이미 Vote(vote_id={existing_vote.id}) 존재 → AI Vote 생성 스킵")
            return {"status": "ignored_vote_exists", "issueId": issue.id}

        # 투표 생성용 AI 호출
        vote_ai = generate_vote_question(issue.title, issue.ai_summary)
        rule_ai = generate_vote_rule(issue.title, issue.ai_summary)

        # Spring Boot에 투표 생성 요청
        send_vote_to_backend(issue, vote_ai, rule_ai)

        return {"status": "success", "issueId": issue.id}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "msg": str(e)}


# ============================================================
# Redis Worker (ISSUE_TRIGGER_QUEUE)
#
#  - "article:{id}"       → 기사 → 이슈 생성
#  - "cp:{id}"            → 커뮤니티 글 → 이슈 생성
#  - "issueApprove:{id}"  → 승인된 이슈 → Vote 생성
#
#  + 처리 성공 시 Redis 플래그 세팅:
#    - article:{id}:triggered
#    - cp:{id}:triggered
#    - issue:{id}:voteCreated
# ============================================================

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
QUEUE = "ISSUE_TRIGGER_QUEUE"

def worker():
    print("🔄 Makgora Issue/Vote Worker started. Listening for jobs...")

    while True:
        try:
            raw = r.rpop(QUEUE)

            if raw is None:
                time.sleep(0.3)
                continue

            print(f"📌 Queue Received: {raw}")

            # 🔥 매 처리마다 새로운 세션 생성
            session = Session()
            session.expire_all()

            # ARTICLE → ISSUE
            if raw.startswith("article:"):
                article_id = int(raw.split(":")[1])
                print(f"➡ Processing Article Issue: {article_id}")

                result = run_issue_for_article(session, article_id)
                print("📝 Result:", result)

                if result.get("status") in ["success", "ignored", "ignored_vote_exists"]:
                    r.set(f"article:{article_id}:triggered", "1")

            # COMMUNITY → ISSUE
            elif raw.startswith("cp:"):
                post_id = int(raw.split(":")[1])
                print(f"➡ Processing Community Issue: {post_id}")

                result = run_issue_for_community(session, post_id)
                print("📝 Result:", result)

                if result.get("status") in ["success", "ignored", "ignored_vote_exists"]:
                    r.set(f"cp:{post_id}:triggered", "1")

            # ISSUE APPROVE → VOTE
            elif raw.startswith("issueApprove:"):
                issue_id = int(raw.split(":")[1])
                print(f"🔥 Issue 승인 감지 → Vote 생성 시작 (issue_id={issue_id})")

                result = run_vote_for_issue(session, issue_id)
                print("📝 Result:", result)

                if result.get("status") in ["success", "ignored_vote_exists", "ignored"]:
                    r.set(f"issue:{issue_id}:voteCreated", "1")

            session.close()

        except Exception as e:
            print("❌ Worker Error:", e)
            traceback.print_exc()
            time.sleep(1)

if __name__ == "__main__":
    worker()

