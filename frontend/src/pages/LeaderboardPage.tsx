import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  User,
  Coins,
  ChevronDown,
  LogOut,
  ShoppingBag,
  Flame,
  BarChart3
} from "lucide-react";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { getRankingTop } from "../api/rankApi";
import { Header } from "../components/layout/Header";

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

type LeaderboardTab = "points" | "winRate" | "streak";

interface RankingResponse {
  userId: number;
  nickname: string;
  rankingType: string;
  rank: number;
  score: number;
}

export function LeaderboardPage({
  onBack,
  onCommunity,
  onNews,
  onPointsShop,
  onProfile,
  onVote,
  user,
  onLogin,
  onLogout,
  onSignup,
}: LeaderboardPageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("points");

  const [leaderboard, setLeaderboard] = useState<RankingResponse[]>([]);
  const [loading, setLoading] = useState(false);

  /** 서버에서 랭킹 가져오기 */
  const fetchLeaderboard = async (tab: LeaderboardTab) => {
    setLoading(true);

    const typeMap: Record<LeaderboardTab, string> = {
      points: "POINTS",
      winRate: "WINRATE",
      streak: "STREAK",
    };

    try {
      const res = await getRankingTop(typeMap[tab]);
      setLeaderboard(res.data || []);
    } catch (e) {
      console.error("🔥 랭킹 불러오기 실패", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  /** 아이콘 타입 */
  const getIcon = () => {
    switch (activeTab) {
      case "points":
        return <Coins className="w-5 h-5 text-yellow-400" />;
      case "winRate":
        return <BarChart3 className="w-5 h-5 text-green-400" />;
      case "streak":
        return <Flame className="w-5 h-5 text-orange-400" />;
    }
  };

  const getStatValue = (item: RankingResponse) => {
    if (activeTab === "points") return `${item.score.toLocaleString()} P`;
    if (activeTab === "winRate") return `${item.score}%`;
    if (activeTab === "streak") return `${item.score} 연승`;
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header activeMenu="leaderboard" />

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
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as LeaderboardTab)}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${
                  activeTab === t.key
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-300">불러오는 중...</p>
          )}

          {!loading && leaderboard.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 p-8 bg-gradient-to-b from-purple-900/30 to-transparent border-b border-white/10">
                {/* 2등 */}
                <div className="flex flex-col items-center justify-end">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-gray-500">
                      2
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center border-2 border-white/20">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-white font-bold mb-1">
                    {top3[1]?.nickname}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold mb-2">
                    {getIcon()}
                    <span>{getStatValue(top3[1])}</span>
                  </div>
                </div>

                {/* 1등 */}
                <div className="flex flex-col items-center justify-end">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-yellow-500 shadow-lg shadow-yellow-500/50">
                      1
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-white/20">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-white font-bold text-lg mb-1">
                    {top3[0]?.nickname}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg mb-2">
                    {getIcon()}
                    <span>{getStatValue(top3[0])}</span>
                  </div>
                </div>

                {/* 3등 */}
                <div className="flex flex-col items-center justify-end">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-2xl font-bold text-white border-4 border-orange-700">
                      3
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center border-2 border-white/20">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-white font-bold mb-1">
                    {top3[2]?.nickname}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 font-bold mb-2">
                    {getIcon()}
                    <span>{getStatValue(top3[2])}</span>
                  </div>
                </div>
              </div>

              {/* 4~10위 리스트 */}
              <div className="p-6">
                {others.map((item, index) => (
                  <div
                    key={item.userId}
                    className="flex items-center gap-4 mb-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                  >
                    {/* Rank - index 기반으로 재생성 */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {index + 4}
                    </div>

                    {/* 이름 */}
                    <div className="flex-1 text-white font-bold">
                      {item.nickname}
                    </div>

                    {/* 점수 */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
                      {getIcon()}
                      <span className="font-bold text-yellow-400">
                        {getStatValue(item)}
                      </span>
                    </div>
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
