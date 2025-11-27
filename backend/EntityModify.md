# 테이블 수정할때 엔터티도 같이 수정

## 11 / 20
### 테이블 추가
- RSS_Articles - 기사 저장 테이블
- Article_Categories - 카테고리(장르) 테이블
- Article_Category_Map - N:N 매핑 테이블 (기사 ↔ 카테고리)
- Article_Summaries - 기사 AI 요약 테이블
    -> RSS 피드(주소)만 DB 에 저장하는 형식이라 기사 전체, 카테고리, AI 기사 요약 추가

### Issues 테이블 수정(칼럼 추가)
- article_id INT NULL COMMENT '연결된 기사 ID', 
- community_post_id INT NULL COMMENT '연결된 커뮤니티 글 ID'
- created_by ENUM('system','admin','ai') DEFAULT 'ai' COMMENT '이슈 생성 주체',
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
- updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
    -> 기사나 커뮤티니 글에서 이슈화 된걸 가져 올 수 있어서 출처표시용으로 추가
    -> 이슈를 어디 기반으로 작성되었는지 미흡해서 추가

### Votes 테이블 수정(칼럼 추가)
- fee_rate 추가
    -> 수수료 기록용으로 추가(투표별 얼마인지 기록 가능)
    -> 하드 코딩하는것보다 찾기 쉬움

### Store_Items 테이블 수정
- category ENUM('avatar','background','skin','badge') NOT NULL COMMENT '아이템 종류'
    -> 기본 avatar 로 들어가게 설정되어있었는데 아이템 종류 선택하도록 변경

### Rankings 테이블 수정
- ranking_type ENUM('points','winrate', 'streak') NOT NULL COMMENT '랭킹 종류'

## 11/21
### Ranking 테이블 수정(칼럼 수정)
- rank -> ranking
    -> 예약어라 테이블이 안만들어짐

## 11/24
### RSS_Articles 테이블(칼럼 추가)
- is_deleted TINYINT
    -> 기사 소프트 딜리트 추가
- thumbnail_url
    -> 썸네일 추가
- category_id
    -> feed에서 가져온 카테고리 직접 저장
- join 테이블 생성
    -> 기사 카테고리 맵핑용

Rankings 테이블 수정
ranking_type ENUM('points','winrate', 'streak') NOT NULL COMMENT '랭킹 종류'

11/20 3:31
vote_users에 vote_id 추가 => 마이페이지 조회시 자신이 한 투표 확인하려고
-----------------------------

VoteOptionEntity에 
  @Column(name = "is_deleted")
  private Boolean isDeleted = false;
추가 => 소프트 딜리트용(임시 숨김, 비활성용)

voteOptionChoiceEntit에
  @Column(name = "odds")
  private Double odds;
추가 => 선택지 배당률

VoteOptionRepository
@Query("SELECT o FROM VoteOptionEntity o LEFT JOIN FETCH o.choices WHERE o.vote.id = :voteId")
List<VoteOptionEntity> findAllWithChoicesByVoteId(Long voteId);
추가 => 옵션+선택지 한번에 가져오기

VoteOptionChoiceRepository
List<VoteOptionChoiceEntity> findByOptionIdOrderByPointsTotalDesc(Long optionId);
추가 => 인기 선택지 순으로 가져오기

VoteUserRepository
Optional<VoteUserEntity> findByUserIdAndVoteId(Long userId, Long voteId);
추가 => 유저가 어떤 선택지 골랐는지
int countByOptionId(Long optionId);
추가 => 옵션 참여자 수 계산

11/21 10:15
pom.xml에 보안관련3개+swagger확인용 1개 추가
http://localhost:8080/swagger-ui/index.html

userentity 수정 => refreshToken 값 저장
### Vote_Users 테이블(유니크 추가, 칼럼 추가)
- unique_vote_user_option
    -> 중복 투표 방지용으로 추가
- isCancelled
    -> 투표 취소 기능 추가

### Article_Category_Map 테이블(테이블 삭제)
    -> 불필요해서 삭제

### RSS_Feeds 테이블(칼럼 추가)
- category_id 추가
    -> 맵핑시키는 테이블이랑 합침

11/24 19:40
프론트 형식
app.tsx통한 라우터 형식으로 변경(아직 pages폴더에 main, login만 있고components/ui에 남은 page있음 )

이메일 인증 추가로 controller, dto, service, response, request 추가

pom.xml에 이메일인증관련 추가

UserEntity 이메일인증 분리 (EmailVerificationEntity로 분리) 

dto/response, request안에 있던 폴더구조 다 다시 밖에있는 response, request에 정리
- sourceName 추가
    -> 언론사 확인용
- join 테이블 생성
    -> 기사 카테고리 맵핑용

## 11/25
* 준우
프론트
- MainPage.tsx : 메인에서 회원가입 버튼 눌렀을 때 로그인 폼을 보여줌.
 
    <button
        onClick={() => navigate("/login")}
        ↪️
        onClick={() => navigate("/login?mode=signup")}
        className="text-gray-300 hover:text-white px-4 py-2"
    >
        회원가입
    </button>

- LoginPage.tsx : URL 파라미터로 회원가입 모드 설정

    const [isSignup, setIsSignup] = useState(false);
    ↪️
    const [isSignup, setIsSignup] = useState(new URLSearchParams(location.search).get("mode") === "signup");

- MainPage.tsx : onClick 없어서 추가함.

    <button
        ↪️
        onClick={() => navigate("/community")}
        className="hover:text-white transition">커뮤니티</button>
  
### Article_Summaries -> ArticleAiTitle(테이블 변경)
- 현실적으로 크롤링이 불가능한 부분이 있어서 변경
- rss 에 있는 title 과 description 으로 AI 제목하는 방향으로 변경

------------------
11/25 11:00

로그인 문제 해결
새로고침시에도 로그인 유지 / 로그아웃 문제 해결

홈페이지 관련 Home(dto, controller, service, response생성)
dto 패키지 생성
dto 내부에 (AiBanner, HotIssue, TopVote 3개 dto생성)


voteentity에 endAt 컬럼 추가 (투표 종료 시간)

Issue, Vote Repository에 코드 추가

RssArticleRepository에 카테고리로 기사 조회 추가
@Query("SELECT a FROM RssArticleEntity a JOIN a.categories c WHERE c.name = :category")
List<RssArticleEntity> findByCategory(String category);

11/26 18:00
------------------
11/27 17:00
IssueEntity에 
    public enum CreatedBy {
        SYSTEM, ADMIN, AI, USER
    }
    USER 추가
