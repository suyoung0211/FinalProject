-- 1. USERS
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 고유 ID',
    
    email VARCHAR(150) NOT NULL UNIQUE COMMENT '로그인 ID로 사용할 이메일 주소',
    email_verified TINYINT(1) DEFAULT 0 COMMENT '이메일 인증 여부 (0=미인증, 1=인증 완료)',
    email_verified_at DATETIME COMMENT '이메일 인증 완료 시각',
    
    username VARCHAR(100) NOT NULL COMMENT '사용자 이름 또는 닉네임',
    password_hash VARCHAR(255) NOT NULL COMMENT '비밀번호 해시값',
    
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '계정 삭제 여부(1=삭제됨)',
    deleted_at DATETIME COMMENT '계정 삭제 처리 시각',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입 날짜',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '정보 수정 날짜'
) COMMENT='1. 사용자 정보 테이블';

-- 2. 개인 학습 주제
CREATE TABLE PersonalStudyTopics (
    topic_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '학습 주제 ID',
    user_id INT NOT NULL COMMENT '주제 소유자',
    topic_name VARCHAR(255) NOT NULL COMMENT '주제명 (예: 파이썬, 정보처리기사)',
    user_topic_type VARCHAR(100) COMMENT '사용자가 입력한 주제 타입(자유 입력)',
    ai_topic_type ENUM('자격증','과목','언어','기타') DEFAULT NULL COMMENT 'AI가 자동 분류한 표준 타입',
    ai_confidence TINYINT DEFAULT NULL COMMENT 'AI 분류 신뢰도(0~100)',
    start_date DATE COMMENT '학습 시작일',
    end_date DATE COMMENT '학습 종료일',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일 (사용자/AI 수정 시 갱신)',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) COMMENT='2. 개인 학습 주제 정보';

-- 3. 개인 학습 진행 상황
CREATE TABLE PersonalStudyProgress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '학습 진행 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    topic_id INT NOT NULL COMMENT '학습 주제 ID',
    progress_text TEXT COMMENT '학습 진행 내용 요약',
    repeated_keywords TEXT COMMENT '반복 키워드',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (topic_id) REFERENCES PersonalStudyTopics(topic_id)
) COMMENT='3. 개인 학습 진행 상황 기록';

-- 4. 개인 일간 투두리스트
CREATE TABLE DailyTodos (
    todo_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '일간 투두 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    topic_id INT NULL COMMENT '관련 주제 (없을 수도 있음)',
    content TEXT NOT NULL COMMENT '할 일 내용',
    is_done BOOLEAN DEFAULT FALSE COMMENT '완료 여부',
    due_date DATE NOT NULL COMMENT '해당 일 날짜',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (topic_id) REFERENCES PersonalStudyTopics(topic_id)
) COMMENT='4. 개인 일간 투두리스트';

-- 5. 개인 주간 투두리스트
CREATE TABLE WeeklyTodos (
    todo_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '주간 투두 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    topic_id INT NULL COMMENT '관련 주제 (없을 수도 있음)',
    content TEXT NOT NULL COMMENT '할 일 내용',
    is_done BOOLEAN DEFAULT FALSE COMMENT '완료 여부',
    start_date DATE NOT NULL COMMENT '주간 시작일',
    end_date DATE NOT NULL COMMENT '주간 종료일',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (topic_id) REFERENCES PersonalStudyTopics(topic_id)
) COMMENT='5. 개인 주간 투두리스트';

-- 6. 개인 학습 메모
CREATE TABLE PersonalStudyNotes (
    note_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메모 ID',
    user_id INT NOT NULL COMMENT '작성자',
    topic_id INT NOT NULL COMMENT '관련 주제',
    content TEXT COMMENT '텍스트 내용',
    image_url VARCHAR(500) COMMENT '이미지 경로(OCR 포함)',
    ai_category VARCHAR(200) COMMENT 'AI 자동 분류 카테고리',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (topic_id) REFERENCES PersonalStudyTopics(topic_id)
) COMMENT='6. 개인 학습 메모';

-- 7. 개인 AI 위키 문서
CREATE TABLE PersonalWikiDocuments (
    doc_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문서 ID',
    user_id INT NOT NULL COMMENT '작성자',
    topic_id INT NULL COMMENT '관련 주제',
    title VARCHAR(255) COMMENT '문서 제목',
    content MEDIUMTEXT COMMENT '문서 내용 (Markdown)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (topic_id) REFERENCES PersonalStudyTopics(topic_id)
) COMMENT='7. 개인 학습용 AI 위키 문서';

-- 8. 개인 AI 코치 알림
CREATE TABLE CoachNotifications (
    noti_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    message TEXT COMMENT '알림 내용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) COMMENT='8. 개인 AI 코치 알림';

-- 9. 그룹 정보
CREATE TABLE StudyGroups (
    group_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '그룹 고유 ID',
    group_name VARCHAR(200) NOT NULL COMMENT '그룹명',
    description TEXT COMMENT '그룹 소개',
    created_by INT NOT NULL COMMENT '그룹 생성자 user_id',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
) COMMENT='9. 스터디 그룹 정보';

-- 10. 그룹 멤버
CREATE TABLE GroupMembers (
    group_id INT NOT NULL COMMENT '그룹 ID',
    user_id INT NOT NULL COMMENT '사용자 ID',
    role ENUM('ADMIN','MEMBER') DEFAULT 'MEMBER' COMMENT '그룹 내 역할',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    PRIMARY KEY(group_id,user_id),
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) COMMENT='10. 그룹-사용자 매핑';

-- 11. 그룹 학습 주제
CREATE TABLE GroupStudyTopics (
    topic_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '학습 주제 ID',
    group_id INT NOT NULL COMMENT '그룹 ID',
    topic_name VARCHAR(255) NOT NULL COMMENT '주제명',
    ai_topic_type ENUM('자격증','과목','언어','기타') DEFAULT NULL COMMENT 'AI 자동 분류 타입',
    ai_confidence TINYINT DEFAULT NULL COMMENT 'AI 분류 신뢰도',
    start_date DATE COMMENT '학습 시작일',
    end_date DATE COMMENT '학습 종료일',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id)
) COMMENT='11. 그룹 학습 주제';

-- 12. 그룹 학습 진행
CREATE TABLE GroupStudyProgress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '그룹 학습 진행 ID',
    group_id INT NOT NULL COMMENT '그룹 ID',
    topic_id INT NOT NULL COMMENT '주제 ID',
    progress_text TEXT COMMENT '그룹 학습 진행 요약',
    repeated_keywords TEXT COMMENT '반복 키워드',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id),
    FOREIGN KEY (topic_id) REFERENCES GroupStudyTopics(topic_id)
) COMMENT='12. 그룹 학습 진행';

-- 13. 그룹 메모
CREATE TABLE GroupNotes (
    note_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '그룹 메모 ID',
    group_id INT NOT NULL COMMENT '그룹 ID',
    topic_id INT NOT NULL COMMENT '주제 ID',
    content TEXT COMMENT '텍스트 내용',
    image_url VARCHAR(500) COMMENT '이미지 경로(OCR 포함)',
    ai_category VARCHAR(200) COMMENT 'AI 자동 분류 카테고리',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id),
    FOREIGN KEY (topic_id) REFERENCES GroupStudyTopics(topic_id)
) COMMENT='13. 그룹 학습 메모';

-- 14. 그룹 AI 위키 문서
CREATE TABLE GroupWikiDocuments (
    doc_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문서 ID',
    group_id INT NOT NULL COMMENT '그룹 ID',
    topic_id INT NULL COMMENT '관련 주제',
    title VARCHAR(255) COMMENT '문서 제목',
    content MEDIUMTEXT COMMENT '문서 내용 (Markdown)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id),
    FOREIGN KEY (topic_id) REFERENCES GroupStudyTopics(topic_id)
) COMMENT='14. 그룹 학습용 AI 위키 문서';

-- 15. 그룹용 AI 코치 자료
CREATE TABLE GroupCoachShared (
    shared_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '공유 ID',
    group_id INT NOT NULL COMMENT '그룹 ID',
    content TEXT NOT NULL COMMENT 'AI 분석 자료',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    FOREIGN KEY (group_id) REFERENCES StudyGroups(group_id)
) COMMENT='15. 그룹용 AI 코치 자료';
