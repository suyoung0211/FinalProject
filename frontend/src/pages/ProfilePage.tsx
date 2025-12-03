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
} from "lucide-react";


import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import api from "../api/api";
import { ProfileImageEditor } from "./ProfileImageEditor";

interface UserProfile {
  nickname: string;
  points: number;
  avatarIcon?: string | null;
  profileFrame?: string | null;
  profileBadge?: string | null;
  email?: string;
  role: string;
  level: number;
}

interface RecentCommunityActivity {
  activityId: number;
  type: "POST" | "COMMENT";
  postId: number;
  postTitle: string;
  contentPreview: string;
  createdAt: string;
}

interface RecentVoteActivity {
  voteUserId: number;
  voteId: number;
  voteTitle: string;
  issueTitle?: string | null;
  choiceId: number;
  choiceText: string;
  pointsBet: number;
  rewardAmount: number | null;
  result: "WIN" | "LOSE" | "PENDING" | "CANCELLED";
  voteCreatedAt: string;
  voteEndAt: string;
  createdAt: string;
}

export function ProfilePage({ onBack }: { onBack: () => void }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [communityActivities, setCommunityActivities] = useState<
    RecentCommunityActivity[]
  >([]);
  const [voteActivities, setVoteActivities] = useState<RecentVoteActivity[]>([]);

  // ================================
  // 🔹 프로필 정보 불러오기
  // ================================
  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.get("/profile/me");
      setUser(res.data);
    };
    loadProfile();
  }, []);

  // ================================
  // 🔹 최근 활동 불러오기
  // ================================
  useEffect(() => {
    api
      .get("/profile/activities/community", { params: { limit: 10 } })
      .then((res) => setCommunityActivities(res.data));

    api
      .get("/profile/activities/votes", { params: { limit: 10 } })
      .then((res) => setVoteActivities(res.data));
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

  if (!user) return <div className="text-white p-8">불러오는 중...</div>;

  // ================================
  // 🔹 null-safe 프로필 표시용 값
  // ================================
  const avatar =
    user.avatarIcon ||
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

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

  // 임시 통계 데이터 (투표 쪽 - 나중에 백엔드 연동 예정)
  const stats = {
    totalBets: 24,
    wonBets: 18,
    lostBets: 6,
    winRate: 75,
    totalEarned: 3200,
    currentStreak: 5,
    bestStreak: 8,
    rank: 142,
  };

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

            <Button
              onClick={() => setIsEditingPhoto(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              사진 수정
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <div className="relative">
              {/* 프로필 이미지 + 프레임 */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <img src={avatar} className="object-cover w-full h-full" />

                {frame && (
                  <img
                    src={frame}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                )}
              </div>

              {/* 닉네임 배지 */}
              {badge && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <img src={badge} className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.nickname}
              </h1>

              {user.email && (
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
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
                    <span className="text-white font-medium">#{stats.rank} 랭킹</span>
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

                {user.role === "ADMIN" && (
                  <div className="px-4 py-2 bg-red-500/20 rounded-full border border-red-500/40 text-red-300">
                    관리자
                  </div>
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

        {/* Stats Grid */}
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
            <div className="text-3xl font-bold text-white mb-1">+{stats.totalEarned}</div>
            <div className="text-sm text-gray-400">총 수익</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-white mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-400">연승 중</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Community */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              최근 커뮤니티 활동
            </h2>

            {communityActivities.length === 0 && (
              <p className="text-gray-400">아직 활동이 없어요.</p>
            )}

            {communityActivities.map((a) => (
              <div
                key={a.activityId}
                className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3"
              >
                <p className="text-white font-medium">{a.postTitle}</p>
                <p className="text-gray-400 text-sm">{a.contentPreview}</p>
              </div>
            ))}
          </div>

          {/* Vote */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              최근 투표 활동
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

            {/* Additional Stats */}
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
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 프로필 이미지 편집 모달 */}
      {isEditingPhoto && (
        <ProfileImageEditor
          onCancel={() => setIsEditingPhoto(false)}
          onSave={handleSaveProfileImage}
        />
      )}
    </div>
  );
}