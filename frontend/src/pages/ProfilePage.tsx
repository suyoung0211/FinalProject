import {
  ArrowLeft,
  User,
  Mail,
  Coins,
  TrendingUp,
  Trophy,
  Calendar,
  BarChart3,
  Award,
  Target,
  Flame,
  Edit2,
  Save,
  X,
  Lock,
  Shield,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useState, useEffect } from 'react';
import { Avatar, AvatarSelector } from '../components/Avatar';
import api from '../api/api';

interface UserProfile {
  username: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
}

// ✅ 백엔드 RecentCommunityActivityResponse DTO와 매핑되는 타입
interface RecentCommunityActivity {
  activityId: number;          // 글이면 postId, 댓글이면 commentId
  type: 'POST' | 'COMMENT';    // CommunityActivityType enum
  postId: number;              // 게시글 상세로 이동할 때 필요
  postTitle: string;
  contentPreview: string;
  createdAt: string;           // LocalDateTime → 문자열로 직렬화됨
}

// ✅ 백엔드 RecentVoteActivityResponse DTO와 매핑되는 타입
interface RecentVoteActivity {
  voteUserId: number;
  voteId: number;
  voteTitle: string;
  issueTitle?: string | null;
  choiceId: number;
  choiceText: string;
  pointsBet: number;
  rewardAmount: number | null; // WIN/LOSE 정산 이후 순이익/손실, 그 외 null
  result: 'WIN' | 'LOSE' | 'PENDING' | 'CANCELLED';
  voteCreatedAt: string;
  voteEndAt: string;
  createdAt: string;           // 내가 베팅한 시각
}

interface ProfilePageProps {
  onBack: () => void;
  user: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
  onAdminPage?: () => void;
  onGoVotePage?: () => void;   // 👈 추가
}

export function ProfilePage({ onBack, user, onUpdateUser, onAdminPage }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminCodeError, setAdminCodeError] = useState('');
  const [editedUsername, setEditedUsername] = useState(user.username);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [selectedAvatar, setSelectedAvatar] = useState<{ type: 'male' | 'female'; variant: number } | null>(
    user.avatarType && user.avatarVariant
      ? { type: user.avatarType, variant: user.avatarVariant }
      : null
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 관리자 여부 확인 (username이 'admin'인 경우)
  const isAdmin = user.username === 'admin';

  // ✅ 최근 커뮤니티 활동 상태 (백엔드 연동)
  const [communityActivities, setCommunityActivities] = useState<RecentCommunityActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // ✅ 최근 투표 활동 상태 (백엔드 연동)
  const [voteActivities, setVoteActivities] = useState<RecentVoteActivity[]>([]);
  const [voteLoading, setVoteLoading] = useState(true);
  const [voteError, setVoteError] = useState<string | null>(null);

  // ✅ 최근 활동 탭 (커뮤니티 / 투표)
  const [activeActivityTab, setActiveActivityTab] = useState<'community' | 'vote'>('community');

  // ✅ 프로필 - 최근 커뮤니티 & 투표 활동 목록 불러오기
  useEffect(() => {
    const fetchCommunityActivities = async () => {
      try {
        setActivitiesLoading(true);
        setActivitiesError(null);

        // 백엔드: GET /api/profile/activities/community?limit=10
        const res = await api.get<RecentCommunityActivity[]>('/profile/activities/community', {
          params: { limit: 10 },
        });

        setCommunityActivities(res.data);
      } catch (error) {
        console.error('최근 커뮤니티 활동 불러오기 실패', error);
        setActivitiesError('최근 커뮤니티 활동을 불러오지 못했습니다.');
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchVoteActivities = async () => {
      try {
        setVoteLoading(true);
        setVoteError(null);

        // 백엔드: GET /api/profile/activities/votes?limit=10
        const res = await api.get<RecentVoteActivity[]>('/profile/activities/votes', {
          params: { limit: 10 },
        });

        setVoteActivities(res.data);
      } catch (error) {
        console.error('최근 투표 활동 불러오기 실패', error);
        setVoteError('최근 투표 활동을 불러오지 못했습니다.');
      } finally {
        setVoteLoading(false);
      }
    };

    fetchCommunityActivities();
    fetchVoteActivities();
  }, []);

  // ✅ 투표 통계 불러오기 (백엔드 API 연동)
  useEffect(() => {
    const fetchVoteStatistics = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        // 백엔드: GET /api/votes/my/statistics
        const res = await api.get<{
          totalBets: number;
          wins: number;
          losses: number;
          pending: number;
          winRate: number;
          currentWinStreak: number;
          maxWinStreak: number;
        }>('/votes/my/statistics');

        // 총 수익 계산: 최근 투표 활동에서 rewardAmount 합산
        // voteActivities가 아직 로드되지 않았을 수 있으므로 별도로 계산
        let totalEarned = 0;
        try {
          const voteRes = await api.get<RecentVoteActivity[]>('/profile/activities/votes', {
            params: { limit: 100 }, // 충분히 많은 데이터 가져오기
          });
          totalEarned = voteRes.data
            .filter((v) => v.rewardAmount !== null && v.result !== 'CANCELLED')
            .reduce((sum, v) => sum + (v.rewardAmount || 0), 0);
        } catch (e) {
          console.warn('총 수익 계산 실패 (무시)', e);
        }

        setStats({
          totalBets: res.data.totalBets || 0,
          wonBets: res.data.wins || 0,
          lostBets: res.data.losses || 0,
          winRate: res.data.winRate ? Math.round(res.data.winRate * 100) : 0, // 백분율로 변환
          totalEarned: totalEarned,
          currentStreak: res.data.currentWinStreak || 0,
          bestStreak: res.data.maxWinStreak || 0,
          rank: 0, // TODO: 랭킹 API 연동 필요
        });
      } catch (error) {
        console.error('투표 통계 불러오기 실패', error);
        setStatsError('투표 통계를 불러오지 못했습니다.');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchVoteStatistics();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleSave = () => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        username: editedUsername,
        name: editedName,
        email: editedEmail,
        avatarType: selectedAvatar?.type,
        avatarVariant: selectedAvatar?.variant,
      });
    }
    setIsEditing(false);
    setIsEditingAvatar(false);
  };

  const handleCancel = () => {
    setEditedUsername(user.username);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setSelectedAvatar(
      user.avatarType && user.avatarVariant
        ? { type: user.avatarType, variant: user.avatarVariant }
        : null
    );
    setIsEditing(false);
    setIsEditingAvatar(false);
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // TODO: 실제로는 백엔드로 요청을 보내야 함
    alert('비밀번호가 성공적으로 변경되었습니다!');
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleAdminCodeSubmit = () => {
    setAdminCodeError('');

    if (!adminCode) {
      setAdminCodeError('관리자 코드를 입력해주세요.');
      return;
    }

    // TODO: 실제로는 백엔드로 요청을 보내야 함
    if (adminCode === 'admin123') {
      alert('관리자 권한이 부여되었습니다!');
      setShowAdminModal(false);
      onAdminPage?.();
    } else {
      setAdminCodeError('잘못된 관리자 코드입니다.');
    }
  };

  const handleCancelAdminCode = () => {
    setShowAdminModal(false);
    setAdminCode('');
    setAdminCodeError('');
  };

  // ✅ 투표 통계 상태 (백엔드 API 연동)
  const [stats, setStats] = useState({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    winRate: 0,
    totalEarned: 0,
    currentStreak: 0,
    bestStreak: 0,
    rank: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // 업적은 지금처럼 더미 유지 (추후 백엔드 연동 가능)
  const achievements = [
    { id: 1, name: '첫 투표', icon: Target, unlocked: true },
    { id: 2, name: '연승 달성', icon: Flame, unlocked: true },
    { id: 3, name: '베팅 마스터', icon: Trophy, unlocked: true },
    { id: 4, name: '예측 전문가', icon: Award, unlocked: false },
  ];

  // ✅ 투표 결과 뱃지 색상/텍스트
  const renderVoteResultBadge = (result: RecentVoteActivity['result']) => {
    if (result === 'WIN') {
      return (
        <div className="px-2 py-1 bg-green-500/20 rounded-full">
          <span className="text-xs text-green-400 font-medium">승리</span>
        </div>
      );
    }
    if (result === 'LOSE') {
      return (
        <div className="px-2 py-1 bg-red-500/20 rounded-full">
          <span className="text-xs text-red-400 font-medium">패배</span>
        </div>
      );
    }
    if (result === 'CANCELLED') {
      return (
        <div className="px-2 py-1 bg-gray-500/20 rounded-full">
          <span className="text-xs text-gray-300 font-medium">취소</span>
        </div>
      );
    }
    return (
      <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
        <span className="text-xs text-yellow-400 font-medium">진행중</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-purple-400" />
              프로필 정보
            </h2>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                편집
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                {selectedAvatar ? (
                  <Avatar type={selectedAvatar.type} variant={selectedAvatar.variant} size={96} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Edit2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">사용자 이름</label>
                    <Input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="사용자 이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                    <Input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                    <Input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                    <Coins className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">{user.points.toLocaleString()} P</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">
                      {stats.rank > 0 ? `#${stats.rank} 랭킹` : '랭킹 없음'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">{stats.totalBets}회 투표</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">{stats.winRate}% 승률</span>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setShowAdminModal(true)}
                    className="bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/30 text-red-400 hover:text-red-300"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    관리자 페이지
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selector */}
        {isEditingAvatar && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-400" />
              아바타 선택
            </h2>
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={(type, variant) => setSelectedAvatar({ type, variant })}
            />
          </div>
        )}

        {/* Stats Grid - 백엔드 API 연동 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.totalBets}</div>
            <div className="text-sm text-gray-400">총 투표</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.winRate}%</div>
            <div className="text-sm text-gray-400">승률</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalEarned > 0 ? '+' : ''}{stats.totalEarned}
            </div>
            <div className="text-sm text-gray-400">총 수익</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-400">연승 중</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ✅ Recent Activities - 커뮤니티 / 투표 탭 */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                최근 활동
              </h2>
              <div className="inline-flex rounded-full bg-black/30 border border-white/10 p-1 text-xs">
                <button
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeActivityTab === 'community'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveActivityTab('community')}
                >
                  커뮤니티
                </button>
                <button
                  className={`px-3 py-1 rounded-full transition-all ${
                    activeActivityTab === 'vote'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveActivityTab('vote')}
                >
                  투표
                </button>
              </div>
            </div>

            {/* 커뮤니티 활동 탭 */}
            {activeActivityTab === 'community' && (
              <>
                {activitiesLoading && (
                  <p className="text-sm text-gray-400">
                    최근 커뮤니티 활동을 불러오는 중입니다...
                  </p>
                )}

                {!activitiesLoading && activitiesError && (
                  <p className="text-sm text-red-400">{activitiesError}</p>
                )}

                {!activitiesLoading && !activitiesError && communityActivities.length === 0 && (
                  <p className="text-sm text-gray-400">아직 커뮤니티 활동이 없어요.</p>
                )}

                {!activitiesLoading && !activitiesError && communityActivities.length > 0 && (
                  <div className="space-y-4">
                    {communityActivities.map((activity) => (
                      <div
                        key={`${activity.type}-${activity.activityId}`}
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          {/* 활동 타입 뱃지 */}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              activity.type === 'POST'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {activity.type === 'POST' ? '게시글 작성' : '댓글 작성'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>

                        {/* 게시글 제목 */}
                        <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
                          {activity.postTitle}
                        </h3>

                        {/* 내용 프리뷰 */}
                        {activity.contentPreview && (
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {activity.contentPreview}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 투표 활동 탭 */}
            {activeActivityTab === 'vote' && (
              <>
                {voteLoading && (
                  <p className="text-sm text-gray-400">
                    최근 투표 활동을 불러오는 중입니다...
                  </p>
                )}

                {!voteLoading && voteError && (
                  <p className="text-sm text-red-400">{voteError}</p>
                )}

                {!voteLoading && !voteError && voteActivities.length === 0 && (
                  <p className="text-sm text-gray-400">아직 투표 기록이 없어요.</p>
                )}

                {!voteLoading && !voteError && voteActivities.length > 0 && (
                  <div className="space-y-4">
                    {voteActivities.map((v) => (
                      <div
                        key={v.voteUserId}
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 mb-1">
                              {v.issueTitle}
                            </span>
                            <h3 className="text-white font-medium text-sm line-clamp-1">
                              {v.voteTitle}
                            </h3>
                          </div>
                          {renderVoteResultBadge(v.result)}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">
                              {v.choiceText}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {v.pointsBet}P 베팅
                            </span>
                          </div>

                          {/* 정산된 금액 표시 */}
                          {v.rewardAmount !== null && v.result !== 'CANCELLED' && (
                            <span
                              className={`text-xs font-medium ${
                                v.rewardAmount > 0
                                  ? 'text-green-400'
                                  : v.rewardAmount < 0
                                  ? 'text-red-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              {v.rewardAmount > 0 ? '+' : ''}
                              {v.rewardAmount}P
                            </span>
                          )}

                          {v.result === 'CANCELLED' && (
                            <span className="text-xs text-gray-300">환불 완료</span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(v.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              업적
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`bg-white/5 backdrop-blur border rounded-xl p-6 text-center transition-all ${
                      achievement.unlocked
                        ? 'border-yellow-500/30 hover:bg-white/10'
                        : 'border-white/10 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                          : 'bg-gray-700'
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-medium text-sm">{achievement.name}</h3>
                  </div>
                );
              })}
            </div>

            {/* Additional Stats - 백엔드 API 연동 */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-4">상세 통계</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">승리한 투표</span>
                  <span className="text-green-400 font-medium">{stats.wonBets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">패배한 투표</span>
                  <span className="text-red-400 font-medium">{stats.lostBets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">최고 연승</span>
                  <span className="text-orange-400 font-medium">{stats.bestStreak}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-400" />
            비밀번호 변경
          </h2>
          {!isChangingPassword ? (
            <Button
              onClick={() => setIsChangingPassword(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              비밀번호 변경
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  현재 비밀번호
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  새 비밀번호
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호 확인
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
              {passwordError && (
                <div className="text-sm text-red-400 mt-2">{passwordError}</div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  변경
                </Button>
                <Button
                  onClick={handleCancelPasswordChange}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Code Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              관리자 인증
            </h2>
            <p className="text-gray-300 mb-4">
              관리자 페이지 접근을 위해 관리자 코드를 입력해주세요.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  관리자 코드
                </label>
                <Input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="관리자 코드를 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdminCodeSubmit();
                    }
                  }}
                />
              </div>
              {adminCodeError && (
                <div className="text-sm text-red-400 mt-2">{adminCodeError}</div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleAdminCodeSubmit}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  확인
                </Button>
                <Button
                  onClick={handleCancelAdminCode}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
