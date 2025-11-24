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
- sourceName 추가
    -> 언론사 확인용
- join 테이블 생성
    -> 기사 카테고리 맵핑용