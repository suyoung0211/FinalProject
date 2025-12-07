import { TrendingUp, User, Coins, Filter, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/vote/CreateVoteModal';

// 🔵 AI 투표 리스트 컴포넌트
import { AiVoteList } from '../components/vote/AiVoteList';

// 🟢 일반 투표 리스트 컴포넌트
import { NormalVoteList } from '../components/vote/NormalVoteList';

import { fetchVoteList } from "../api/voteApi";
import { fetchNormalVoteList } from "../api/normalVoteApi";
import { useAuth } from "../hooks/useAuth";

export function VoteListPage({ onBack, onMarketClick }: any) {
  const [aiVotes, setAiVotes] = useState<any[]>([]);
  const [normalVotes, setNormalVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  const [sortType, setSortType] = useState("latest");
  const { user } = useAuth();

  const mapStatus = (status: string) => {
    switch (status) {
      case "ONGOING": return "진행중";
      case "FINISHED":
      case "RESOLVED":
      case "REWARDED": return "종료";
      case "CANCELLED": return "취소됨";
      default: return "기타";
    }
  };

  /* ========================================================
      🔥 AI + Normal 투표 각각 분리해서 불러오기
  ======================================================== */
  const loadVoteList = async () => {
    setLoading(true);

    try {
      const [aiRes, normalRes] = await Promise.all([
        fetchVoteList(),
        fetchNormalVoteList()
      ]);

      /* AI 매핑 */
      const aiMapped = (aiRes.data || [])
        .filter((v: any) => v.status !== "REVIEWING")
        .map((v: any) => ({
          id: v.id,
          type: "AI",
          category: v.category ?? "기타",
          title: v.title,
          description: v.description ?? "",
          totalVolume: v.totalPoints,
          totalParticipants: v.totalParticipants,
          deadline: String(v.endAt).slice(0, 10),
          status: mapStatus(v.status),
          createdAt: v.createdAt,
          options: v.options,
        }));

      /* NORMAL 매핑 */
      const normalMapped = (normalRes.data.votes || []).map((v: any) => ({
        id: v.id,
        type: "NORMAL",
        category: v.category ?? "기타",
        title: v.title,
        description: v.description ?? "",
        totalVolume: v.totalPoints ?? 0,
        totalParticipants: v.totalParticipants ?? 0,
        deadline: v.endAt ? String(v.endAt).slice(0, 10) : "",
        status: mapStatus(v.status),
        createdAt: v.createdAt,
        options: v.options ?? [],
      }));
      console.log("🔥 Normal Vote Data:", normalMapped);

      setAiVotes(aiMapped);
      setNormalVotes(normalMapped);

    } catch (err) {
      console.error("투표 목록 불러오기 실패:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadVoteList();
  }, []);

  /* 🔥 정렬 함수 (두 리스트 각각 적용) */
  const sortVotes = (list: any[]) => {
    const sorted = [...list];

    if (sortType === "latest") {
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    }

    if (sortType === "popular") {
      return sorted.sort((a, b) => (b.participants ?? 0) - (a.participants ?? 0));
    }

    return sorted;
  };

  const sortedAiVotes = sortVotes(aiVotes);
  const sortedNormalVotes = sortVotes(normalVotes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="vote" />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">이슈 투표</h1>
            <p className="text-gray-400">AI 예측 투표와 일반 투표를 참여해보세요</p>
          </div>

          {user && (
            <Button
              onClick={() => setShowCreateVoteModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">일반 투표 생성</span>
            </Button>
          )}
        </div>

        {/* 정렬 */}
        <div className="mb-6 flex items-center justify-end gap-3">
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="bg-white/40 text-black px-3 py-2 rounded-lg"
          >
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">로딩 중...</div>
        ) : (
          <div className="space-y-10">
            
            {/* 🔵 AI VOTE SECTION */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">AI 예측 마켓</h2>
              <AiVoteList items={sortedAiVotes} onMarketClick={onMarketClick} />
            </div>

            {/* 🟢 NORMAL VOTE SECTION */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">일반 투표</h2>
              <NormalVoteList items={sortedNormalVotes} onMarketClick={onMarketClick} />
            </div>

          </div>
        )}
      </div>

      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
        onCreate={loadVoteList}
      />
    </div>
  );
}
