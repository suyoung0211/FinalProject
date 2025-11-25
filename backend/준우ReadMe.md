백엔드 api 규칙

공통 에러 처리 방식 ExceptionalHandler

404
401(로그인 필요)
403(권한없음)
400(유효성 에러)

3) JWT에서 userId 어떻게 뽑는지 규칙 통일

세션 없음 → 무조건 JWT
즉:

헤더 "Authorization: Bearer xxx"

userId는 SecurityContext에서 꺼냄

테스트 상황에서는 body로 userId 받기 허용 (초기 때문에)

➡️ 이 규칙을 4명이 합의해야 함.
----------------------------------------------------------------
4) URL 규칙 통일

예:

/api/community/**

/api/issues/**

/api/votes/**

/api/store/**

/api/admin/**

➡️ 네가 맡는 URL prefix는 여기.
---------------------------------------------------------------------------

1. 왜 DB가 이렇게 바뀐 건지부터 정리

지금 올려준 쿼리들은 “처음 버전 + 변경 로그(11/20~24)”가 합쳐진 최신 스키마야.
바뀐 이유를 기능 기준으로 보면:

1) 기사/뉴스 쪽 확장 (RSS 관련)

옛날: RSS 피드 URL만 저장했다가, 요청 시마다 기사 가져오는 수준 구상.

지금:

RSS_Articles : 실제 기사 본문/링크/썸네일까지 DB에 저장

Article_Categories : 기사 장르(경제, 정치…) 관리

RSS_Feeds 에 category_id 추가 : 피드별 기본 카테고리 연결

Article_Summaries : 기사별 AI 요약 저장 (LLM 모델명 포함)

👉 이유:

“과거 기사”도 다시 써먹고 싶음 (그래프, 회상, 통계).

매번 AI로 요약 재생성하면 돈/시간 많이 드니까 요약 결과 캐시하려고.

2) Issues 테이블이 기사/커뮤니티랑 연결된 이유
article_id INT NULL,
community_post_id INT NULL,
created_by ENUM('system','admin','ai'),
...


기사에서 “이거 이슈로 올리자” → article_id 로 연결

커뮤니티 글을 이슈화 → community_post_id 연결

created_by : 이 이슈가 시스템이 자동 생성했는지 / 관리자가 만든 건지 / AI가 만든 건지 표시

👉 즉, 이슈 = 토론/투표의 중심 토픽,
어디서 온 건지 출처를 남기기 위해 이렇게 확장된 거.

3) Votes / Vote_Users 변경 이유

fee_rate : 나중에 “이 투표는 수수료 10%였다” 같은 걸 기록하기 위해

Vote_Users 의 vote_id + UNIQUE 제약:

마이페이지에서 “내가 참가한 투표들” 조회하려고

같은 옵션에 중복 배팅 막으려고 (unique_vote_user_option)

4) Rankings / Store / is_deleted / odds 등

Rankings.ranking_type → points / winrate / streak 등 여러 랭킹 지원

Store_Items.category NOT NULL → 아이템 종류를 명확하게

Vote_Options.is_deleted / RSS_Articles.is_deleted → 소프트 딜리트용

Vote_Option_Choices.odds → 선택지 배당률

👉 전체적으로:

“해커톤/서비스에서 필요할 법한 데이터들을 미리 다 박아두자” 느낌으로
테이블이 한 번 업그레이드 된 상태라고 보면 됨.

---------------------------------------------------------------------------
5. 전체 흐름, 한 줄로 그려보면

예시: “커뮤니티 글 목록 보기”

프론트 CommunityPage.tsx

마운트 시 GET /api/community/posts 호출 (axios)

JwtAuthFilter (백엔드)

헤더에 토큰 있으면 user 정보 파싱해서 SecurityContext 에 넣음

CommunityController.getPosts()

CommunityService.getPosts() 호출

CommunityService

communityPostRepository.findAllByOrderByCreatedAtDesc() 실행

결과 List<CommunityPostEntity> 를 List<CommunityPostResponse> 로 매핑

컨트롤러

ApiResponse< List<CommunityPostResponse> > 형태로 응답

프론트

JSON 받아서 카드형 리스트로 렌더링

“이슈에 댓글 달기”도 똑같이:
프론트 → /api/issues/{issueId}/comments POST →
Jwt 필터 → 컨트롤러 → 서비스 → 레포지토리 → DB insert → 응답.