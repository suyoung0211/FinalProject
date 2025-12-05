import { TrendingUp, User, Coins, Filter, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/vote/CreateVoteModal';
import { VoteList } from '../components/vote/VoteList';
import { fetchVoteList } from "../api/voteApi";
import { fetchNormalVoteList, createNormalVote } from "../api/normalVoteApi";
import { useAuth } from "../hooks/useAuth";

export function VoteListPage({ onBack, onMarketClick }: any) {
  const [voteIssues, setVoteIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("latest");

  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [statuses] = useState<string[]>(["전체", "진행중", "종료", "취소됨"]);

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  const { user } = useAuth();

  /* 상태 매핑 */
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

  /* ===============================
     🔥 통합 투표 리스트 불러오기
     =============================== */
  useEffect(() => {
    async function load() {
      try {
        const [aiRes, normalRes] = await Promise.all([
          fetchVoteList(),
          fetchNormalVoteList()
        ]);

        const aiList = aiRes.data || [];
        const normalList = normalRes.data.votes || [];
        
        const dynamicCategories = new Set<string>();
        dynamicCategories.add("전체");

        /* AI 투표 매핑 */
        const aiMapped = aiList
          .filter((v: any) => v.status !== "REVIEWING")
          .map((v: any) => {
            dynamicCategories.add(v.category ?? "기타");

            return {
              id: v.id,
              type: "AI",
              category: v.category ?? "기타",
              title: v.title,
              description: v.description ?? "",
              totalVolume: v.totalPoints,
              participants: v.totalParticipants,
              deadline: String(v.endAt).slice(0, 10),
              status: mapStatus(v.status),
              createdAt: v.createdAt,
              options: v.options,
            };
          });

        /* NORMAL 투표 매핑 */
        const normalMapped = normalList.map((v: any) => {
          dynamicCategories.add(v.category ?? "기타");

          return {
            id: v.id,
            type: "NORMAL",
            category: v.category ?? "기타",
            title: v.title,
            description: v.description ?? "",
            totalVolume: v.totalPoints ?? 0,
            participants: v.participantCount ?? 0,
            deadline: v.endAt ? String(v.endAt).slice(0, 10) : "",
            status: mapStatus(v.status),
            createdAt: v.createdAt,
            options: v.options,
          };
        });

        const combined = [...aiMapped, ...normalMapped];
        setVoteIssues(combined);
        setCategories(Array.from(dynamicCategories));

      } catch (err) {
        console.error("투표 목록 불러오기 실패:", err);
      }

      setLoading(false);
    }
    load();
  }, []);

  /* 투표 생성 */
  const handleCreateNormalVote = async (data: any) => {
    try {
      await createNormalVote({
        title: data.question,
        description: data.description,
        category: data.category,
        endAt: data.endDate
      });

      alert("투표가 생성되었습니다!");
      window.location.reload(); // 새 리스트 갱신

    } catch (err) {
      console.error("NORMAL 생성 실패:", err);
      alert("생성 실패");
    }
  };

  /* 필터링 */
  const filteredIssues = voteIssues.filter(issue => {
    const categoryMatch =
      selectedCategory === '전체' || issue.category === selectedCategory;

    const statusMatch =
      selectedStatus === '전체' || issue.status === selectedStatus;

    const keyword = searchQuery.toLowerCase();
    const searchMatch =
      issue.title.toLowerCase().includes(keyword) ||
      issue.description.toLowerCase().includes(keyword);

    return categoryMatch && statusMatch && searchMatch;
  });

  /* 정렬 */
  const sortedIssues = [...filteredIssues].sort((a, b) => {

    if (sortType === "ai-first") {
      if (a.type === "AI" && b.type !== "AI") return -1;
      if (a.type !== "AI" && b.type === "AI") return 1;
    }

    if (sortType === "latest") {
      const aTime = Date.parse(a.createdAt);
      const bTime = Date.parse(b.createdAt);
      return bTime - aTime;
    }

    if (sortType === "popular") {
      return (b.participants ?? 0) - (a.participants ?? 0);
    }

    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="vote" />

      <div className="container mx-auto px-4 py-8 pt-24">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">이슈 투표</h1>
            <p className="text-gray-400">AI 예측 마켓과 일반 투표를 참여해보세요</p>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이슈 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-2xl text-white"
          />
        </div>

        {/* 카테고리 + 정렬 + 생성 */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">카테고리</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 + 생성 */}
          <div className="flex items-center gap-3">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="bg-white/40 text-black px-3 py-2 rounded-lg"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="ai-first">AI 우선</option>
            </select>

            {user && (
              <Button
                onClick={() => setShowCreateVoteModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">투표 생성</span>
              </Button>
            )}
          </div>

        </div>

        {/* 상태 필터 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">상태</span>
          </div>

          <div className="flex gap-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full ${
                  selectedStatus === status
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 리스트 */}
        {loading ? (
          <div className="text-center text-white py-20">로딩 중...</div>
        ) : (
          <VoteList items={sortedIssues} onMarketClick={onMarketClick} />
        )}

        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-300">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* NORMAL 생성 */}
      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
        onCreate={handleCreateNormalVote}
      />
    </div>
  );
}
