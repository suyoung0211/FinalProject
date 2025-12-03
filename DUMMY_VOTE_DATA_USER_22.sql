-- ============================================
-- 투표 시스템 테스트용 더미 데이터 (user_id = 22)
-- 🔥 user_id는 로그인해서 쓰고 있는데 user_id 값으로 변경만 해주면 됨 🔥
-- 🔥 22 검색해서 값만 변경시켜주세요 🔥
-- ============================================
-- 실행 순서: 기존 데이터 삭제 → Issues → Votes → Vote_Options → Vote_Option_Choices → Vote_Users

-- 주의: user_id = 22가 Users 테이블에 존재해야 합니다!

-- -- 0️⃣ 기존 데이터 삭제 (외래 키 제약 때문에 올바른 순서로 삭제)
-- -- 주의: 이 쿼리는 기존 데이터를 모두 삭제합니다!
-- -- 순서: 자식 테이블부터 삭제하고, 참조 관계를 먼저 해제해야 함

-- -- 1. Votes의 correct_choice_id 참조 해제 (Vote_Option_Choices 참조 제거)
-- UPDATE Votes SET correct_choice_id = NULL WHERE vote_id IN (100, 101, 102, 103);

-- -- 2. 가장 자식 테이블부터 삭제
-- DELETE FROM Vote_Users WHERE vote_id IN (100, 101, 102, 103);

-- -- 3. Vote_Option_Choices 삭제 (Votes의 참조가 이미 해제됨)
-- DELETE FROM Vote_Option_Choices WHERE choice_id IN (100, 101, 102, 103, 104, 105, 106, 107);

-- -- 4. Vote_Options 삭제
-- DELETE FROM Vote_Options WHERE option_id IN (100, 101, 102, 103);

-- -- 5. Votes 삭제
-- DELETE FROM Votes WHERE vote_id IN (100, 101, 102, 103);

-- -- 6. Issues 삭제 (가장 부모 테이블)
-- DELETE FROM Issues WHERE issue_id IN (100, 101, 102, 103);

-- 1️⃣ 이슈 생성 (4개) - 명시적으로 issue_id 지정
-- 기존 데이터가 있어도 안전하게 삽입하기 위해 높은 ID 사용
INSERT INTO Issues (issue_id, article_id, community_post_id, title, thumbnail, content, source, ai_summary, ai_points, status, created_by, created_at, updated_at)
VALUES
  (100, NULL, NULL, '2025년 비트코인이 15만 달러를 돌파할까요?', NULL, '비트코인 가격 전망', 'https://example.com/btc', 'AI 요약 내용', '{"score": 85}', 'approved', 'ai', NOW(), NOW()),
  (101, NULL, NULL, '손흥민이 이번 시즌 20골 이상을 기록할까요?', NULL, '손흥민 시즌 골 예측', 'https://example.com/son', 'AI 요약 내용', '{"score": 75}', 'approved', 'ai', NOW(), NOW()),
  (102, NULL, NULL, 'Tesla 주가가 2025년 내 500달러를 돌파할까요?', NULL, '테슬라 주가 전망', 'https://example.com/tsla', 'AI 요약 내용', '{"score": 70}', 'approved', 'ai', NOW(), NOW()),
  (103, NULL, NULL, 'AI가 2025년 내에 의사 면허 시험을 통과할까요?', NULL, 'AI 의사 면허 시험', 'https://example.com/ai', 'AI 요약 내용', '{"score": 60}', 'approved', 'ai', NOW(), NOW())
ON DUPLICATE KEY UPDATE issue_id = issue_id; -- 이미 있으면 업데이트하지 않음

-- 2️⃣ 투표 생성 (4개) - 명시적으로 vote_id 지정
-- 투표 1: 승리한 투표 (REWARDED, 정답 맞춤) - 가장 오래된 투표
INSERT INTO Votes (vote_id, issue_id, title, status, total_points, total_participants, fee_rate, end_at, correct_choice_id, is_rewarded, created_at, updated_at)
VALUES
  (100, 100, '2025년 비트코인이 15만 달러를 돌파할까요?', 'REWARDED', 5000, 3, 0.10, DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

-- 투표 2: 승리한 투표 (REWARDED, 정답 맞춤) - 두 번째로 오래된 투표 (연승 유지)
INSERT INTO Votes (vote_id, issue_id, title, status, total_points, total_participants, fee_rate, end_at, correct_choice_id, is_rewarded, created_at, updated_at)
VALUES
  (101, 101, '손흥민이 이번 시즌 20골 이상을 기록할까요?', 'REWARDED', 3000, 2, 0.10, DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 투표 3: 패배한 투표 (REWARDED, 정답 틀림) - 세 번째 투표
INSERT INTO Votes (vote_id, issue_id, title, status, total_points, total_participants, fee_rate, end_at, correct_choice_id, is_rewarded, created_at, updated_at)
VALUES
  (102, 102, 'Tesla 주가가 2025년 내 500달러를 돌파할까요?', 'REWARDED', 4000, 2, 0.10, DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 투표 4: 진행중인 투표 (ONGOING) - 가장 최근 투표
INSERT INTO Votes (vote_id, issue_id, title, status, total_points, total_participants, fee_rate, end_at, correct_choice_id, is_rewarded, created_at, updated_at)
VALUES
  (103, 103, 'AI가 2025년 내에 의사 면허 시험을 통과할까요?', 'ONGOING', 2500, 1, 0.10, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- 3️⃣ 투표 옵션 생성 (각 투표당 1개 옵션) - 명시적으로 option_id 지정
INSERT INTO Vote_Options (option_id, vote_id, option_title, start_date, end_date, is_deleted, created_at, updated_at)
VALUES
  (100, 100, '2025년 12월 31일까지', NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
  (101, 101, '2024-2025 시즌 종료까지', NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
  (102, 102, '2025년 12월 31일까지', NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
  (103, 103, '2025년 12월 31일까지', NULL, NULL, 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- 4️⃣ 선택지 생성 (각 옵션당 2개 선택지: "한다", "안한다") - 명시적으로 choice_id 지정
INSERT INTO Vote_Option_Choices (choice_id, option_id, choice_text, points_total, participants_count, odds, created_at, updated_at)
VALUES
  -- 투표 1의 선택지 (option_id = 100)
  (100, 100, '한다', 3000, 2, 1.67, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
  (101, 100, '안한다', 2000, 1, 2.50, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
  -- 투표 2의 선택지 (option_id = 101)
  (102, 101, '한다', 1500, 1, 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
  (103, 101, '안한다', 2000, 1, 1.50, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
  -- 투표 3의 선택지 (option_id = 102)
  (104, 102, '한다', 2500, 1, 1.60, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
  (105, 102, '안한다', 1500, 1, 2.67, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
  -- 투표 4의 선택지 (option_id = 103)
  (106, 103, '한다', 2500, 1, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
  (107, 103, '안한다', 0, 0, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- 5️⃣ 투표 정답 설정 (correct_choice_id 업데이트)
-- 투표 1: "한다"가 정답 (choice_id = 100) - 사용자 승리
UPDATE Votes SET correct_choice_id = 100 WHERE vote_id = 100;

-- 투표 2: "한다"가 정답 (choice_id = 102) - 사용자 승리
UPDATE Votes SET correct_choice_id = 102 WHERE vote_id = 101;

-- 투표 3: "한다"가 정답 (choice_id = 104) - 사용자 승리 (연승 유지, 가장 최근 종료된 투표)
UPDATE Votes SET correct_choice_id = 104 WHERE vote_id = 102;

-- 6️⃣ 사용자 투표 기록 (user_id = 22)
-- 투표 1: "한다" 선택 (정답 맞춤) - 2000P 베팅 (가장 오래된 투표)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (100, 22, 100, 100, 2000, 0, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY));

-- 투표 2: "한다" 선택 (정답 맞춤) - 1500P 베팅 (두 번째 투표, 연승 유지)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (101, 22, 101, 102, 1500, 0, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));

-- 투표 3: "한다" 선택 (정답 맞춤) - 2500P 베팅 (세 번째 투표, 연승 유지)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (102, 22, 102, 104, 2500, 0, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 투표 4: "한다" 선택 (진행중) - 2500P 베팅 (가장 최근 투표)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (103, 22, 103, 106, 2500, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7️⃣ 다른 사용자 투표 기록 (통계 계산을 위해)
-- 투표 1: 다른 사용자들이 "한다" 선택 (user_id = 1, 3 가정)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES 
  (100, 1, 100, 100, 1000, 0, DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
  (100, 3, 100, 101, 2000, 0, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

-- 투표 2: 다른 사용자가 "안한다" 선택 (user_id = 1 가정)
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (101, 1, 101, 103, 2000, 0, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- 투표 3: 다른 사용자가 "안한다" 선택 (user_id = 1 가정) - 하지만 정답은 "한다"이므로 패배
INSERT INTO Vote_Users (vote_id, user_id, option_id, choice_id, points_bet, is_cancelled, created_at, updated_at)
VALUES (102, 1, 102, 105, 1500, 0, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ============================================
-- 예상 결과 (user_id = 22 기준):
-- ============================================
-- 총 투표: 4회
-- 승리한 투표: 3회 (투표 1, 투표 2, 투표 3)
-- 패배한 투표: 0회
-- 진행중: 1회 (투표 4)
-- 승률: 100% (3승 / 3결과 확정)
-- 현재 연승: 3연승 (투표 1, 투표 2, 투표 3 연속 승리)
-- 최고 연승: 3연승 (투표 1, 투표 2, 투표 3 연속 승리)
-- 총 수익: 투표 1, 2, 3 승리 시 수익 계산 (정산 완료된 투표만)
--
-- 참고: 연승 계산은 종료된 투표만 시간순으로 정렬하여 계산됩니다.
--       가장 최근 종료된 투표부터 역순으로 연속 승리한 횟수를 계산합니다.

-- user_id = 22의 투표 기록 확인
SELECT * FROM Vote_Users WHERE user_id = 22;

-- 투표 상태 확인
SELECT vote_id, issue_id, title, status, correct_choice_id, is_rewarded 
FROM Votes 
WHERE vote_id IN (100, 101, 102, 103)
ORDER BY created_at;

