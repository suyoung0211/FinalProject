11 / 20 수영
테이블 추가
RSS_Articles - 기사 저장 테이블
Article_Categories - 카테고리(장르) 테이블
Article_Category_Map - N:N 매핑 테이블 (기사 ↔ 카테고리)
Article_Summaries - 기사 AI 요약 테이블

-> RSS 피드(주소)만 DB 에 저장하는 형식이라 기사 전체, 카테고리, AI 기사 요약 추가

Issues 테이블 수정(칼럼 추가)
article_id INT NULL COMMENT '연결된 기사 ID', 
community_post_id INT NULL COMMENT '연결된 커뮤니티 글 ID'
created_by ENUM('system','admin','ai') DEFAULT 'ai' COMMENT '이슈 생성 주체',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'

-> 기사나 커뮤티니 글에서 이슈화 된걸 가져 올 수 있어서 출처표시용으로 추가
-> 이슈를 어디 기반으로 작성되었는지 미흡해서 추가

Votes 테이블 수정(칼럼 추가)
fee_rate 추가

-> 수수료 기록용으로 추가(투표별 얼마인지 기록 가능)
-> 하드 코딩하는것보다 찾기 쉬움