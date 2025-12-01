import { ArrowLeft, Trophy, TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { getRankingTop } from "../api/rankApi";
import { Header } from '../components/layout/Header';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface LeaderboardPageProps {
  onBack: () => void;
  onCommunity?: () => void;
  onNews?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onVote?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

type LeaderboardTab = 'points' | 'winRate' | 'streak';

interface RankingResponse {
  rankingId: number;
  userId: number;
  nickname: string;
  rankingType: string;
  rank: number;
  score: number;
}

export function LeaderboardPage({
  onBack, onCommunity, onNews, onPointsShop, onProfile, onVote,
  user, onLogin, onLogout, onSignup
}: LeaderboardPageProps) {

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('points');

  const [leaderboard, setLeaderboard] = useState<RankingResponse[]>([]);
  const [loading, setLoading] = useState(false);

  /** 🔥 서버에서 랭킹 가져오기 */
  const fetchLeaderboard = async (tab: LeaderboardTab) => {
    setLoading(true);

    const typeMap: Record<LeaderboardTab, string> = {
      points: "POINTS",
      winRate: "WINRATE",
      streak: "STREAK"
    };

    try {
      const res = await getRankingTop(typeMap[tab]);
      setLeaderboard(res.data.data || []);
    } catch (e) {
      console.error("🔥 랭킹 불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  /** 처음 로딩 + 탭 변경 시마다 호출 */
  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const getStatLabel = () => {
    switch (activeTab) {
      case 'points': return '포인트';
      case 'winRate': return '승률';
      case 'streak': return '연승';
      default: return '포인트';
    }
  };

  const getStatValue = (item: RankingResponse) => item.score.toLocaleString();

  /** 상단 3명 */
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Header */}
      <Header activeMenu="leaderboard" />
            

      {/* 내용 */}
      <div className="container mx-auto px-4 py-8 pt-48">
        <div className="max-w-6xl mx-auto">

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-6 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            리더보드
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { key: "points", label: "💰 포인트" },
              { key: "winRate", label: "📊 승률" },
              { key: "streak", label: "🔥 연승" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as LeaderboardTab)}
                className={`px-8 py-3 rounded-xl font-bold transition ${
                  activeTab === t.key
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && <p className="text-center text-gray-300">불러오는 중...</p>}

          {/* Leaderboard */}
          {!loading && leaderboard.length > 0 && (
            <div className="bg-white/5 border border-white/20 rounded-3xl overflow-hidden">

              {/* Top 3 */}
              <div className="grid grid-cols-3 gap-4 p-8 border-b border-white/10">
                {top3.map((item, idx) => (
                  <div key={item.userId} className="flex flex-col items-center">
                    <div className={`w-${idx === 1 ? "24" : "20"} h-${idx === 1 ? "24" : "20"} rounded-full 
                      ${idx === 1 ? "bg-yellow-500" : idx === 0 ? "bg-gray-400" : "bg-orange-600"}
                      flex items-center justify-center text-white text-3xl font-bold`}
                    >
                      {item.rank}
                    </div>

                    <span className="text-white font-bold mt-3">{item.nickname}</span>
                    <span className="text-yellow-400 font-bold">{getStatValue(item)}</span>
                  </div>
                ))}
              </div>

              {/* Others */}
              <div className="p-6">
                {others.map(item => (
                  <div key={item.userId} className="flex items-center gap-4 mb-3 p-4 bg-white/5 rounded-xl hover:bg-white/10">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {item.rank}
                    </div>
                    <div className="flex-1 text-white font-bold">{item.nickname}</div>
                    <span className="text-yellow-400 font-bold">{getStatValue(item)}</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
