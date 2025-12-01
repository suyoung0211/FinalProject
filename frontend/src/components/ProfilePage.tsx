import { ArrowLeft, User, Mail, Coins, TrendingUp, Trophy, Calendar, BarChart3, Award, Target, Flame, Edit2, Save, X, Lock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { Avatar, AvatarSelector } from './Avatar';
import { Header } from "./layout/Header";

interface UserProfile {
  username: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
}

interface ProfilePageProps {
  onBack: () => void;
  user: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
  onAdminPage?: () => void;
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
    
    // 임시: 실제로는 백엔드로 요청을 보내야 함
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
    
    // 임시: 실제로는 백엔드로 요청을 보내야 함
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

  // 임시 통계 데이터
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

  const recentActivities = [
    {
      id: 1,
      question: '2025년 비트코인이 15만 달러를 돌파할까요?',
      vote: 'YES',
      amount: 200,
      result: 'pending',
      date: '2025-11-18',
    },
    {
      id: 2,
      question: '손흥민이 이번 시즌 20골 이상을 기록할까요?',
      vote: 'NO',
      amount: 150,
      result: 'won',
      profit: 120,
      date: '2025-11-15',
    },
    {
      id: 3,
      question: 'Tesla 주가가 2025년 내 500달러를 돌파할까요?',
      vote: 'YES',
      amount: 300,
      result: 'won',
      profit: 240,
      date: '2025-11-12',
    },
    {
      id: 4,
      question: 'AI가 2025년 내에 의사 면허 시험을 통과할까요?',
      vote: 'YES',
      amount: 250,
      result: 'lost',
      date: '2025-11-10',
    },
  ];

  const achievements = [
    { id: 1, name: '첫 투표', icon: Target, unlocked: true },
    { id: 2, name: '연승 달성', icon: Flame, unlocked: true },
    { id: 3, name: '베팅 마스터', icon: Trophy, unlocked: true },
    { id: 4, name: '예측 전문가', icon: Award, unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
       <Header activeMenu="vote" />

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
                
                {/* Admin Button - Right side of badges */}
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
          {/* Recent Activities */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              최근 활동
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium text-sm flex-1">{activity.question}</h3>
                    {activity.result === 'won' && (
                      <div className="px-2 py-1 bg-green-500/20 rounded-full">
                        <span className="text-xs text-green-400 font-medium">승리</span>
                      </div>
                    )}
                    {activity.result === 'lost' && (
                      <div className="px-2 py-1 bg-red-500/20 rounded-full">
                        <span className="text-xs text-red-400 font-medium">패배</span>
                      </div>
                    )}
                    {activity.result === 'pending' && (
                      <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                        <span className="text-xs text-yellow-400 font-medium">진행중</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded ${
                          activity.vote === 'YES'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {activity.vote}
                      </span>
                      <span className="text-gray-400">{activity.amount}P</span>
                    </div>
                    {activity.result === 'won' && (
                      <span className="text-green-400 font-medium">+{activity.profit}P</span>
                    )}
                    {activity.result === 'lost' && (
                      <span className="text-red-400 font-medium">-{activity.amount}P</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{activity.date}</div>
                </div>
              ))}
            </div>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">현재 비밀번호</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">새 비밀번호</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">비밀번호 확인</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">관리자 코드</label>
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