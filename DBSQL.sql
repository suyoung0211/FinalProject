-- 1. Users 테이블
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 고유 ID',
    login_id VARCHAR(150) NOT NULL UNIQUE COMMENT '로그인용 이메일',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 해시',
    nickname VARCHAR(50) NOT NULL COMMENT '닉네임',
    role ENUM('user','admin') DEFAULT 'user' COMMENT '사용자 역할: 일반(user) / 관리자(admin)',
    points INT DEFAULT 0 COMMENT '보유 포인트',
    level INT DEFAULT 1 COMMENT '사용자 레벨',
    profile_image VARCHAR(255) COMMENT '프로필 사진 URL',
    profile_background VARCHAR(255) COMMENT '프로필 배경 이미지 URL',
    profile_frame VARCHAR(255) COMMENT '프로필 테두리 URL';
    profile_badge VARCHAR(255) COMMENT '프로필 닉네임 뱃지 URL'
    
    email_verified TINYINT(1) DEFAULT 0 COMMENT '이메일 인증 여부 (0=미인증, 1=인증 완료)',
    email_verification_token VARCHAR(255) COMMENT '이메일 인증 토큰',
    email_token_expires DATETIME COMMENT '이메일 인증 토큰 만료 시간',
    
    status ENUM('active','inactive','deleted') DEFAULT 'active' COMMENT '사용자 상태: active=정상, inactive=휴면, deleted=삭제',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '정보 수정일'
);

-- 2. RSS_Feeds 테이블 (수정: category_id 추가)
CREATE TABLE RSS_Feeds (
    feed_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'RSS 피드 ID',
    url VARCHAR(255) NOT NULL COMMENT 'RSS URL',
    source_name VARCHAR(100) NOT NULL COMMENT '소스 이름',
    
    -- 수정된 부분: 카테고리 연결
    category_id INT NOT NULL COMMENT '카테고리 ID',

    last_fetched DATETIME COMMENT '마지막 수집 시간',
    status ENUM('active','inactive') DEFAULT 'active' COMMENT '활성 상태',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',

    FOREIGN KEY (category_id) REFERENCES Article_Categories(category_id)
);

-- 3. Issues 테이블
CREATE TABLE Issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '이슈 고유 ID',

    article_id INT NULL COMMENT '연결된 기사 ID', 
    community_post_id INT NULL COMMENT '연결된 커뮤니티 글 ID',

    title VARCHAR(255) NOT NULL COMMENT '이슈 제목',
    thumbnail VARCHAR(255) COMMENT '썸네일 이미지 URL',
    content TEXT COMMENT '이슈 상세 내용',
    source VARCHAR(255) COMMENT '출처 URL/정보',

    ai_summary TEXT COMMENT 'AI 요약 내용',
    ai_points JSON COMMENT 'AI 평가: 포인트 ',

    status ENUM('pending','approved','rejected') DEFAULT 'pending' COMMENT '승인 상태',
    approved_at DATETIME COMMENT '승인 시각',
    rejected_at DATETIME COMMENT '거절 시각',

    created_by ENUM('system','admin','ai') DEFAULT 'ai' COMMENT '이슈 생성 주체',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',

    FOREIGN KEY (article_id) REFERENCES RSS_Articles(article_id) ON DELETE SET NULL,
    FOREIGN KEY (community_post_id) REFERENCES Community_Posts(post_id) ON DELETE SET NULL
);

-- 4. Votes 테이블
CREATE TABLE Votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '투표 고유 ID',
    issue_id INT NOT NULL COMMENT '연결된 이슈 ID',
    title VARCHAR(255) NOT NULL COMMENT '투표 제목',
    status ENUM('ongoing','finished','cancelled') DEFAULT 'ongoing' COMMENT '투표 상태: 진행중/종료/중단',
    cancellation_reason VARCHAR(500) DEFAULT NULL COMMENT '투표 중단 사유',
    total_points INT DEFAULT 0 COMMENT '총 배팅 포인트',
    total_participants INT DEFAULT 0 COMMENT '총 참여자 수',
    ai_progress_summary TEXT COMMENT 'AI가 생성한 투표 진행 상황 요약',
    fee_rate DECIMAL(5,2) DEFAULT 0.10 COMMENT '투표 수수료율',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '투표 생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '정보 수정일',
    FOREIGN KEY (issue_id) REFERENCES Issues(issue_id)
);

-- 5. Vote_Options 테이블
CREATE TABLE Vote_Options (
    option_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '투표 옵션 ID',
    vote_id INT NOT NULL COMMENT '연결된 투표 ID',
    option_title VARCHAR(255) NOT NULL COMMENT '항목 제목 (예: "10일에 한다")',
    start_date DATE COMMENT '옵션 시작일 (없으면 NULL)',
    end_date DATE COMMENT '옵션 종료일 (없으면 NULL)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (vote_id) REFERENCES Votes(vote_id)
);

-- 6. Vote_Option_Choices 테이블
CREATE TABLE Vote_Option_Choices (
    choice_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '선택지 ID',
    option_id INT NOT NULL COMMENT '연결된 투표 옵션 ID',
    choice_text VARCHAR(255) NOT NULL COMMENT '선택지 텍스트 (예: "한다", "안한다")',
    points_total INT DEFAULT 0 COMMENT '해당 선택지에 배팅된 총 포인트',
    participants_count INT DEFAULT 0 COMMENT '해당 선택지 참여자 수',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (option_id) REFERENCES Vote_Options(option_id)
);

-- 7. Vote_Users 테이블
CREATE TABLE Vote_Users (
    vote_user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '투표 참여 고유 ID',
    vote_id INT NOT NULL COMMENT '투표 ID',
    user_id INT NOT NULL COMMENT '참여한 사용자 ID',
    option_id INT NOT NULL COMMENT '투표 옵션 ID',
    choice_id INT NOT NULL COMMENT '선택한 선택지 ID',
    points_bet INT DEFAULT 0 COMMENT '배팅한 포인트',
    is_cancelled TINYINT(1) DEFAULT 0 COMMENT '투표 취소 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '참여 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    FOREIGN KEY (vote_id) REFERENCES Votes(vote_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (option_id) REFERENCES Vote_Options(option_id),
    FOREIGN KEY (choice_id) REFERENCES Vote_Option_Choices(choice_id),
    -- 옵션별 중복 투표 방지: 하나의 사용자가 하나의 옵션에 대해 1회만 투표 가능
    CONSTRAINT unique_vote_user_option UNIQUE (vote_id, user_id, option_id)
);


-- 8. Vote_Rules 테이블
CREATE TABLE Vote_Rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '투표 규칙 ID',
    vote_id INT NOT NULL COMMENT '연결된 투표 ID',
    rule_type VARCHAR(100) NOT NULL COMMENT '규칙 유형 (예: 최소배팅, 최대배팅, 옵션제한 등)',
    rule_description TEXT COMMENT '규칙 설명 (AI가 생성한 규칙 텍스트)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (vote_id) REFERENCES Votes(vote_id)
);

-- 9. Votes_Status_History 테이블
CREATE TABLE Votes_Status_History (
    status_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '투표 상태 기록 ID',
    vote_id INT NOT NULL COMMENT '연결된 투표 ID',
    status ENUM('진행중','마감','결과확정','보상분배') NOT NULL COMMENT '상태 단계',
    status_date DATETIME NOT NULL COMMENT '상태 기록 일시',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '기록 생성일',
    FOREIGN KEY (vote_id) REFERENCES Votes(vote_id)
);

-- 10. Comments 테이블
CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 고유 ID',
    issue_id INT NOT NULL COMMENT '연결된 이슈 ID',
    user_id INT NOT NULL COMMENT '댓글 작성자 ID',
    parent_id INT DEFAULT NULL COMMENT '대댓글 연결 ID (없으면 NULL)',
    content TEXT NOT NULL COMMENT '댓글 내용',
    position ENUM('찬성','반대','중립') DEFAULT '중립' COMMENT '찬반/중립 표시',
    user_position VARCHAR(50) COMMENT '댓글 작성자의 포지션 표시 (Vote_Users.position와 연동 가능)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (issue_id) REFERENCES Issues(issue_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (parent_id) REFERENCES Comments(comment_id)
);

-- 11. Community_Posts 테이블
CREATE TABLE Community_Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '커뮤니티 게시글 ID',
    user_id INT NOT NULL COMMENT '작성자 ID',
    title VARCHAR(255) COMMENT '게시글 제목',
    content TEXT COMMENT '게시글 내용',
    post_type ENUM('포인트자랑','이슈추천','일반') DEFAULT '일반' COMMENT '게시글 유형',
    recommendation_count INT DEFAULT 0 COMMENT '추천 수 (토픽 등록 기준)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 12. Community_Comments 테이블
CREATE TABLE Community_Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '커뮤니티 댓글 ID',
    post_id INT NOT NULL COMMENT '연결된 게시글 ID',
    user_id INT NOT NULL COMMENT '댓글 작성자 ID',
    parent_id INT DEFAULT NULL COMMENT '대댓글 연결 ID (NULL이면 게시글 댓글)',
    content TEXT NOT NULL COMMENT '댓글 내용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (post_id) REFERENCES Community_Posts(post_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (parent_id) REFERENCES Community_Comments(comment_id)
);

-- 13. Store_Items 테이블
CREATE TABLE Store_Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '상점 아이템 ID',
    name VARCHAR(255) NOT NULL COMMENT '아이템 이름',
    type ENUM('point','cash') NOT NULL COMMENT '포인트 구매 / 현금 구매',
    category ENUM('avatar','frame','badge') NOT NULL COMMENT '아이템 종류',
    price INT NOT NULL COMMENT '가격',
    stock INT DEFAULT 0 COMMENT '재고 수량',
    image VARCHAR(255) COMMENT '이미지 URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
);

-- 14. User_Store 테이블
CREATE TABLE User_Store (
    user_store_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 아이템 구매 기록 ID',
    user_id INT NOT NULL COMMENT '구매자 ID',
    item_id INT NOT NULL COMMENT '구매한 아이템 ID',
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '구매 시각',
    refundable TINYINT(1) DEFAULT 1 COMMENT '환불 가능 여부 (1=가능, 0=불가)',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (item_id) REFERENCES Store_Items(item_id)
);

-- 15. Admin_Actions 테이블
CREATE TABLE Admin_Actions (
    action_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '관리자 활동 ID',
    admin_id INT NOT NULL COMMENT '관리자 사용자 ID',
    action_type VARCHAR(255) NOT NULL COMMENT '행동 유형 (이슈 승인, 삭제, 토픽 등록 등)',
    target_type VARCHAR(50) COMMENT '대상 타입 (이슈, 게시글, 댓글 등)',
    target_id INT COMMENT '대상 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '행동 시각',
    FOREIGN KEY (admin_id) REFERENCES Users(user_id)
);

-- 16. Rankings 테이블
CREATE TABLE Rankings (
    ranking_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '랭킹 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    ranking_type ENUM('points','winrate', 'streak') NOT NULL COMMENT '랭킹 종류',
    ranking INT COMMENT '순위',
    score INT COMMENT '점수/포인트',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '마지막 갱신일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- 17. 기사 저장 테이블 (RSS_Articles) 
CREATE TABLE RSS_Articles (
    article_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '기사 ID',
    feed_id INT NOT NULL COMMENT 'RSS 피드 ID',

    -- 수정된 부분: feed에서 가져온 카테고리 직접 저장
    category_id INT NOT NULL COMMENT '카테고리 ID',

    title VARCHAR(500) NOT NULL COMMENT '기사 제목',
    link VARCHAR(500) NOT NULL UNIQUE COMMENT '기사 원문 링크',
    content LONGTEXT COMMENT '기사 본문',

    -- 수정된 부분: 기사 썸네일 저장
    thumbnail_url VARCHAR(500) COMMENT '기사 대표 이미지 URL',

    published_at DATETIME COMMENT '기사 게시 시간',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (0=활성, 1=삭제)',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',

    FOREIGN KEY (feed_id) REFERENCES RSS_Feeds(feed_id),
    FOREIGN KEY (category_id) REFERENCES Article_Categories(category_id)
);

-- 18. 카테고리(장르) 테이블
CREATE TABLE Article_Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 ID',
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '카테고리명',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일'
);

-- 20. 기사 AI 제목 재작성 테이블
CREATE TABLE Article_AiTitles (
    ai_title_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'AI 제목 ID',

    article_id INT NOT NULL COMMENT '기사 ID (기사당 1개의 AI 제목만 유지)',

    ai_title LONGTEXT COMMENT 'AI가 재작성한 기사 제목',

    model_name VARCHAR(100) COMMENT 'LLM 모델명 (예: gpt-4.1-mini)',

    -- 요약 상태(PENDING, PROCESSING, SUCCESS, FAILED) → 제목 생성 상태 관리
    status VARCHAR(20) NOT NULL COMMENT '제목 생성 상태',

    -- 실패 또는 재시도 관리
    try_count INT NOT NULL DEFAULT 0 COMMENT '재시도 횟수',

    -- 실패 이유 저장
    last_error TEXT COMMENT '마지막 오류 메시지',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',

    -- 상태 변경 또는 재시도 시 갱신
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최근 업데이트 시각',

    -- 제목 생성 성공 시각
    last_success_at DATETIME COMMENT 'AI 제목 생성 성공 시각',

    -- 기사당 1개의 AI 제목 행 유지 보장
    UNIQUE KEY uk_article_ai_title (article_id),

    FOREIGN KEY (article_id) REFERENCES RSS_Articles(article_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='기사 AI 제목 재작성 관리';
