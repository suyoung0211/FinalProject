import { TrendingUp, User, Coins, Filter, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/vote/CreateVoteModal';

import { AiVoteList } from '../components/vote/AiVoteList';
import { NormalVoteList } from '../components/vote/NormalVoteList';

import { fetchVoteList } from "../api/voteApi";
import { fetchNormalVoteList } from "../api/normalVoteApi";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function VoteListPage() {
  const navigate = useNavigate();

  const onMarketClick = (id: number, type: "AI" | "NORMAL") => {
    navigate(`/vote/${id}`, { state: { voteType: type } });
  };

  const [aiVotes, setAiVotes] = useState<any[]>([]);
  const [normalVotes, setNormalVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  const { user } = useAuth();

  // 검색 및 정렬
  const [aiSearch, setAiSearch] = useState("");
  const [aiSort, setAiSort] = useState("latest");
  const [normalSearch, setNormalSearch] = useState("");
  const [normalSort, setNormalSort] = useState("latest");

  // 🔥 진행중 / 종료됨 버튼 상태
  const [statusFilter, setStatusFilter] = useState<"ONGOING" | "FINISHED">("ONGOING");

  const loadVoteList = async () => {
    setLoading(true);

    try {
      const [aiRes, normalRes] = await Promise.all([
        fetchVoteList(),
        fetchNormalVoteList()
      ]);

      const aiMapped = (aiRes.data || [])
        .filter((v: any) => v.status !== "REVIEWING" && v.status !== "CANCELLED")
        .map((v: any) => ({
          id: v.id,
          type: "AI",
          title: v.title,
          description: v.description ?? "",
          totalParticipants: v.totalParticipants,
          endAt: v.endAt,
          createdAt: v.createdAt,
          status: v.status,
          options: v.options,
          myParticipation: v.myParticipation ?? null,
          expectedOdds: v.expectedOdds ?? null,
          expectedReward: v.expectedReward ?? null,
          settlementSummary: v.settlementSummary ?? null,
          correctChoiceId: v.correctChoiceId ?? null,
        }));

      const normalMapped = (normalRes.data.votes || [])
        .filter((v: any) => v.status !== "REVIEWING" && v.status !== "CANCELLED")
        .map((v: any) => ({
          id: v.id,
          type: "NORMAL",
          title: v.title,
          description: v.description ?? "",
          totalParticipants: v.totalParticipants ?? 0,
          endAt: v.endAt,
          createdAt: v.createdAt,
          status: v.status,
          options: v.options ?? [],
        }));

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

  // 🔥 상태 분류
  const finishedStates = ["FINISHED", "RESOLVED", "REWARDED"];

  const filterByStatus = (item: any) => {
    if (statusFilter === "ONGOING") {
      return item.status === "ONGOING";
    }
    if (statusFilter === "FINISHED") {
      return finishedStates.includes(item.status);
    }
    return false;
  };

  /* ========================================================
      🔍 AI 검색 + 정렬 + 상태 필터링
  ======================================================== */
  const filteredAiVotes = aiVotes
    .filter(filterByStatus)
    .filter((v) => {
      const t = aiSearch.toLowerCase();
      return v.title.toLowerCase().includes(t) || v.description.toLowerCase().includes(t);
    })
    .sort((a, b) => {
      if (aiSort === "latest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (aiSort === "popular") return (b.totalParticipants ?? 0) - (a.totalParticipants ?? 0);
      if (aiSort === "end") return Date.parse(a.endAt ?? "") - Date.parse(b.endAt ?? "");
      return 0;
    });

  /* ========================================================
      🔍 Normal 검색 + 정렬 + 상태 필터링
  ======================================================== */
  const filteredNormalVotes = normalVotes
    .filter(filterByStatus)
    .filter((v) => {
      const t = normalSearch.toLowerCase();
      return v.title.toLowerCase().includes(t) || v.description.toLowerCase().includes(t);
    })
    .sort((a, b) => {
      if (normalSort === "latest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (normalSort === "popular") return (b.totalParticipants ?? 0) - (a.totalParticipants ?? 0);
      if (normalSort === "end") return Date.parse(a.endAt ?? "") - Date.parse(b.endAt ?? "");
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="vote" />

      <div className="container mx-auto px-4 py-8 pt-24">

        {/* TITLE */}
        <div className="flex items-center justify-between mb-8 mt-15">
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

        {/* 🔥 진행중 / 종료됨 버튼 */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === "ONGOING"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            onClick={() => setStatusFilter("ONGOING")}
          >
            진행중
          </button>

          <button
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === "FINISHED"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            onClick={() => setStatusFilter("FINISHED")}
          >
            종료됨
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">로딩 중...</div>
        ) : (
          <div className="space-y-16">

            {/* 🔵 AI SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">AI 예측 마켓</h2>

                <div className="flex items-center gap-3">
                  <input
                    value={aiSearch}
                    onChange={(e) => setAiSearch(e.target.value)}
                    placeholder="AI 투표 검색"
                    className="bg-white/40 text-black px-3 py-2 rounded-lg w-40 sm:w-60"
                  />

                  <select
                    value={aiSort}
                    onChange={(e) => setAiSort(e.target.value)}
                    className="bg-white/40 text-black px-3 py-2 rounded-lg"
                  >
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="end">마감순</option>
                  </select>
                </div>
              </div>

              <AiVoteList items={filteredAiVotes} onMarketClick={onMarketClick} />
            </div>

            {/* 🟢 NORMAL SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">일반 투표</h2>

                <div className="flex items-center gap-3">
                  <input
                    value={normalSearch}
                    onChange={(e) => setNormalSearch(e.target.value)}
                    placeholder="일반 투표 검색"
                    className="bg-white/40 text-black px-3 py-2 rounded-lg w-40 sm:w-60"
                  />

                  <select
                    value={normalSort}
                    onChange={(e) => setNormalSort(e.target.value)}
                    className="bg-white/40 text-black px-3 py-2 rounded-lg"
                  >
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="end">마감순</option>
                  </select>
                </div>
              </div>

              <NormalVoteList items={filteredNormalVotes} onMarketClick={onMarketClick} />
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
