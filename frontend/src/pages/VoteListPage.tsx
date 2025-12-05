import { TrendingUp, User, Coins, Filter, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/vote/CreateVoteModal';
import { VoteList } from '../components/vote/VoteList';
import { fetchVoteList } from "../api/voteApi";
import { useAuth } from "../hooks/useAuth";

export function VoteListPage({ onBack, onMarketClick }: any) {
  const [voteIssues, setVoteIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("latest"); 

  // 동적 카테고리 + 상태
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [statuses] = useState<string[]>(["전체", "진행중", "종료", "취소됨"]);

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const { user } = useAuth();

  // 백엔드 status → 프론트 상태명 매핑
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
  console.log("🔵 [DEBUG] mapped item before filter =", voteIssues);

  /** 🧲 백엔드에서 투표 리스트 가져오기 */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchVoteList();
        console.log("🟡 [FRONT] fetchVoteList() raw =", res.data);
        const list = res.data;

        // 카테고리 자동 추출
        const dynamicCategories = new Set<string>();
        dynamicCategories.add("전체");
        
        const mapped = list
          .filter((v: any) => v.status !== "REVIEWING") // REVIEWING은 리스트에서 제외
          .map((v: any) => {
            console.log("✔ type of v.endAt =", typeof v.endAt, "value =", v.endAt);

            const category = v.category ?? "기타";
            dynamicCategories.add(category);

            return {
              id: v.id,
              category,
              title: v.title ?? "(제목 없음)",
              description: v.description ?? "",
              totalVolume: v.totalPoints ?? 0,
              participants: v.totalParticipants ?? 0,
              deadline: v.endAt ? String(v.endAt).slice(0, 10) : "",
              status: mapStatus(v.status),
              options: v.options ?? [],
              createdAt: v.createdAt,
            };
          });
         console.log("🟣 [FRONT] mapped vote issues =", mapped);

        setVoteIssues(mapped);
        setCategories(Array.from(dynamicCategories));

      } catch (err) {
        console.error("투표 목록 불러오기 실패:", err);
      }
      setLoading(false);
    }

    load();
  }, []);

  /** 🔍 필터링 */
  const filteredIssues = voteIssues.filter(issue => {
  const categoryMatch =
    selectedCategory === '전체' || issue.category === selectedCategory;

  const statusMatch =
    selectedStatus === '전체' || issue.status === selectedStatus;

  const searchMatch =
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase());

  return categoryMatch && statusMatch && searchMatch;
});

// 🔥 최신순 / 인기순 정렬
const sortedIssues = [...filteredIssues].sort((a, b) => {
  if (sortType === "latest") {
    // 1순위: createdAt (내림차순)
    const aTime = a.createdAt ? Date.parse(a.createdAt) : NaN;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : NaN;

    if (!Number.isNaN(aTime) && !Number.isNaN(bTime) && aTime !== bTime) {
      return bTime - aTime;
    }

    // 2순위: id (내림차순)
    return (b.id ?? 0) - (a.id ?? 0);
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

        {/* 제목 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">이슈 투표</h1>
            <p className="text-gray-400">
              다양한 이슈를 예측하고 포인트를 획득하세요
            </p>
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
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl 
                       border border-white/20 rounded-2xl text-white"
          />
        </div>

        {/* 카테고리 & 정렬 & 투표 생성 */}
<div className="mb-6 flex items-center justify-between">

  {/* 카테고리 부분 */}
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
  {/* 🔥 우측: 정렬 + 생성 버튼 */}
  <div className="flex items-center gap-3">

    {/* 정렬 선택 */}
    <select
      value={sortType}
      onChange={(e) => setSortType(e.target.value)}
      className="bg-white/40 text-black px-3 py-2 rounded-lg border border-gradient-to-r/20"
    >
      <option value="latest">최신순</option>
      <option value="popular">인기순</option>
    </select>

    {/* 투표 생성 버튼 */}
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

        {/* 본문 리스트 */}
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

      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
      />
    </div>
  );
}
