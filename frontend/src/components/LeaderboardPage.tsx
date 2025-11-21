import { ArrowLeft, Trophy, TrendingUp, Flame, Medal, Crown, Star, BarChart3 } from 'lucide-react';
import { Avatar } from './Avatar';
import { useState } from 'react';

interface LeaderboardUser {
  rank: number;
  username: string;
  name: string;
  points: number;
  winRate: number;
  totalBets: number;
  currentStreak: number;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
}

interface LeaderboardPageProps {
  onBack: () => void;
  currentUser?: string;
}

export function LeaderboardPage({ onBack, currentUser }: LeaderboardPageProps) {
  const [sortBy, setSortBy] = useState<'points' | 'winRate' | 'streak'>('points');

  // 임시 리더보드 데이터
  const leaderboardData: LeaderboardUser[] = [
    {
      rank: 1,
      username: 'prediction_king',
      name: '예측왕',
      points: 15420,
      winRate: 87,
      totalBets: 156,
      currentStreak: 12,
      avatarType: 'male',
      avatarVariant: 4,
    },
    {
      rank: 2,
      username: 'crypto_master',
      name: '크립토마스터',
      points: 14580,
      winRate: 84,
      totalBets: 142,
      currentStreak: 8,
      avatarType: 'male',
      avatarVariant: 2,
    },
    {
      rank: 3,
      username: 'trend_hunter',
      name: '트렌드헌터',
      points: 13920,
      winRate: 82,
      totalBets: 138,
      currentStreak: 15,
      avatarType: 'female',
      avatarVariant: 2,
    },
    {
      rank: 4,
      username: 'market_guru',
      name: '마켓구루',
      points: 12650,
      winRate: 79,
      totalBets: 124,
      currentStreak: 6,
      avatarType: 'male',
      avatarVariant: 3,
    },
    {
      rank: 5,
      username: 'fortune_teller',
      name: '포춘텔러',
      points: 11980,
      winRate: 81,
      totalBets: 118,
      currentStreak: 9,
      avatarType: 'female',
      avatarVariant: 4,
    },
    {
      rank: 6,
      username: 'vote_master',
      name: '투표마스터',
      points: 10540,
      winRate: 76,
      totalBets: 132,
      currentStreak: 4,
      avatarType: 'male',
      avatarVariant: 1,
    },
    {
      rank: 7,
      username: 'smart_bettor',
      name: '스마트베터',
      points: 9820,
      winRate: 78,
      totalBets: 108,
      currentStreak: 7,
      avatarType: 'female',
      avatarVariant: 1,
    },
    {
      rank: 8,
      username: 'rising_star',
      name: '라이징스타',
      points: 8960,
      winRate: 74,
      totalBets: 96,
      currentStreak: 11,
      avatarType: 'female',
      avatarVariant: 3,
    },
    {
      rank: 9,
      username: 'lucky_seven',
      name: '럭키세븐',
      points: 8230,
      winRate: 72,
      totalBets: 89,
      currentStreak: 3,
      avatarType: 'male',
      avatarVariant: 2,
    },
    {
      rank: 10,
      username: 'trend_setter',
      name: '트렌드세터',
      points: 7890,
      winRate: 75,
      totalBets: 84,
      currentStreak: 5,
      avatarType: 'female',
      avatarVariant: 2,
    },
  ];

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case 'winRate':
        return b.winRate - a.winRate;
      case 'streak':
        return b.currentStreak - a.currentStreak;
      default:
        return b.points - a.points;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      default:
        return 'bg-white/10';
    }
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
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">리더보드</h1>
          </div>
          <p className="text-gray-400">최고의 예측 전문가들과 경쟁하세요</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-gray-400/50">
                {sortedData[1]?.avatarType && sortedData[1]?.avatarVariant ? (
                  <Avatar type={sortedData[1].avatarType} variant={sortedData[1].avatarVariant} size={80} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600" />
                )}
              </div>
              <div className="absolute -top-2 -right-2">
                <Medal className="w-8 h-8 text-gray-300" />
              </div>
            </div>
            <h3 className="text-white font-bold mb-1">{sortedData[1]?.name}</h3>
            <p className="text-gray-400 text-sm mb-2">@{sortedData[1]?.username}</p>
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 px-4 py-2 rounded-full">
              <span className="text-white font-bold">{sortedData[1]?.points.toLocaleString()}P</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Star className="w-6 h-6 text-yellow-400 mb-2 animate-pulse" />
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-yellow-400/50">
                {sortedData[0]?.avatarType && sortedData[0]?.avatarVariant ? (
                  <Avatar type={sortedData[0].avatarType} variant={sortedData[0].avatarVariant} size={96} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500" />
                )}
              </div>
              <div className="absolute -top-2 -right-2">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{sortedData[0]?.name}</h3>
            <p className="text-gray-400 text-sm mb-2">@{sortedData[0]?.username}</p>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 rounded-full">
              <span className="text-white font-bold text-lg">{sortedData[0]?.points.toLocaleString()}P</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-orange-400/50">
                {sortedData[2]?.avatarType && sortedData[2]?.avatarVariant ? (
                  <Avatar type={sortedData[2].avatarType} variant={sortedData[2].avatarVariant} size={80} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600" />
                )}
              </div>
              <div className="absolute -top-2 -right-2">
                <Medal className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <h3 className="text-white font-bold mb-1">{sortedData[2]?.name}</h3>
            <p className="text-gray-400 text-sm mb-2">@{sortedData[2]?.username}</p>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 rounded-full">
              <span className="text-white font-bold">{sortedData[2]?.points.toLocaleString()}P</span>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-gray-400 text-sm">정렬:</span>
          <button
            onClick={() => setSortBy('points')}
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'points'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            포인트
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'winRate'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            승률
          </button>
          <button
            onClick={() => setSortBy('streak')}
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'streak'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            연승
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-4xl mx-auto">
          <div className="space-y-3">
            {sortedData.map((user, index) => {
              const isCurrentUser = user.username === currentUser;
              const displayRank = index + 1;

              return (
                <div
                  key={user.username}
                  className={`bg-white/5 backdrop-blur border rounded-2xl p-4 transition-all ${
                    isCurrentUser
                      ? 'border-purple-500/50 ring-2 ring-purple-500/30'
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(displayRank) || (
                        <div className={`w-10 h-10 rounded-xl ${getRankBadgeColor(displayRank)} flex items-center justify-center`}>
                          <span className="text-white font-bold">{displayRank}</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      {user.avatarType && user.avatarVariant ? (
                        <Avatar type={user.avatarType} variant={user.avatarVariant} size={56} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{user.name}</h3>
                      <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                          <BarChart3 className="w-4 h-4" />
                          <span>{user.points.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-400">포인트</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-400 font-bold">
                          <TrendingUp className="w-4 h-4" />
                          <span>{user.winRate}%</span>
                        </div>
                        <p className="text-xs text-gray-400">승률</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400 font-bold">
                          <Flame className="w-4 h-4" />
                          <span>{user.currentStreak}</span>
                        </div>
                        <p className="text-xs text-gray-400">연승</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">10</div>
            <div className="text-sm text-gray-400">전체 참가자</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">78%</div>
            <div className="text-sm text-gray-400">평균 승률</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">15</div>
            <div className="text-sm text-gray-400">최고 연승</div>
          </div>
        </div>
      </div>
    </div>
  );
}
