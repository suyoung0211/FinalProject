import { TrendingUp, User, Coins, Filter, Search, Plus, Vote as VoteIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/CreateVoteModal';
import { fetchVoteList } from "../api/voteApi";

type VoteCategory = '전체' | '정치' | '경제' | '크립토' | '스포츠' | '엔터테인먼트' | '기술' | '사회';
type VoteStatus = '전체' | '진행중' | '종료';

interface VoteIssue {
  id: number;
  category: string;
  title: string;
  description: string;
  yesPercentage: number;
  noPercentage: number;
  totalVolume: number;
  participants: number;
  deadline: string;
  status: '진행중' | '종료';
  trending?: boolean;
}

export function VoteListPage({
  onBack,
  onMarketClick,
  user
}: any) {

  const [voteIssues, setVoteIssues] = useState<VoteIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<VoteCategory>('전체');
  const [selectedStatus, setSelectedStatus] = useState<VoteStatus>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  const categories: VoteCategory[] = ['전체', '정치', '경제', '크립토', '스포츠', '엔터테인먼트', '기술', '사회'];
  const statuses: VoteStatus[] = ['전체', '진행중', '종료'];

  /** 🧲 백엔드에서 투표 리스트 가져오기 */
useEffect(() => {
  async function load() {
    try {
      const res = await fetchVoteList();

      const mapped = res.data.map((v: any) => {
        const yes = v.options?.find((o: any) => o.label === "YES")?.percentage ?? 50;
        const no = v.options?.find((o: any) => o.label === "NO")?.percentage ?? 50;

        return {
          id: v.id,
          category: v.issue?.category ?? "기타",
          title: v.question ?? v.title ?? "(제목 없음)",
          description: v.issue?.description ?? "",
          yesPercentage: yes,
          noPercentage: no,
          totalVolume: v.totalBets ?? 0,
          participants: v.totalParticipants ?? 0,
          deadline: v.endAt ? v.endAt.substring(0, 10) : "",
          status: v.status === "OPEN" ? "진행중" : "종료",
          trending:
            (v.totalParticipants ?? 0) > 500 ||
            (v.totalBets ?? 0) > 200000,
        };
      });

      setVoteIssues(mapped);

    } catch (e) {
      console.error("투표 목록 불러오기 실패:", e);
    }
    setLoading(false);
  }

  load();
}, []);

  // 필터링
  const filteredIssues = voteIssues.filter(issue => {
    const categoryMatch = selectedCategory === '전체' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === '전체' || issue.status === selectedStatus;
    const searchMatch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header activeMenu="vote" />

      <div className="container mx-auto px-4 py-8 pt-24">

        {/* 제목 & 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">이슈 투표</h1>
            <p className="text-gray-400">다양한 이슈를 예측하고 포인트를 획득하세요</p>
          </div>

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

        {/* 검색 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이슈 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6">
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {filteredIssues.map((issue, index) => (
          <div
                key={`${issue.id}-${index}`}
                onClick={() => onMarketClick && onMarketClick(issue.id.toString())}
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                    {issue.category}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      issue.status === '진행중'
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>

                <h3 className="text-white font-bold text-lg mb-2">{issue.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{issue.description}</p>

                {/* YES/NO */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-green-400 font-medium text-sm">YES</span>
                      <span className="text-green-400 font-bold">{issue.yesPercentage}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${issue.yesPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-red-400 font-medium text-sm">NO</span>
                      <span className="text-red-400 font-bold">{issue.noPercentage}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${issue.noPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-gray-400 text-sm border-t border-white/10 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      <span>{(issue.totalVolume / 1000).toFixed(0)}K P</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{issue.participants.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">마감: {issue.deadline}</span>
                </div>

                {/* Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarketClick && onMarketClick(issue.id.toString());
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  투표하기
                </Button>
              </div>
            ))}
          </div>
        )}

        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-300">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      <CreateVoteModal isOpen={showCreateVoteModal} onClose={() => setShowCreateVoteModal(false)} />
    </div>
  );
}
