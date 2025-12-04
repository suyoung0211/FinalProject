import { TrendingUp, User, Coins, Filter, Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Header } from '../components/layout/Header';
import { CreateVoteModal } from '../components/CreateVoteModal';
import { VoteList } from '../components/vote/VoteList';
import { fetchVoteList } from "../api/voteApi";

type VoteCategory = '전체' | '정치' | '경제' | '크립토' | '스포츠' | '엔터테인먼트' | '기술' | '사회';
type VoteStatus = '전체' | '진행중' | '종료';

interface VoteOptionChoice {
  label: string;
  percentage: number;
}

interface VoteOption {
  id: number;
  label: string;
  choices: VoteOptionChoice[];
}

interface VoteIssue {
  id: number;
  category: string;
  title: string;
  description: string;
  options: VoteOption[];
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

  const categories: VoteCategory[] = [
    '전체', '정치', '경제', '크립토', '스포츠', '엔터테인먼트', '기술', '사회'
  ];
  
  const statuses: VoteStatus[] = ['전체', '진행중', '종료'];

  /** 🧲 백엔드에서 투표 리스트 가져오기 */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchVoteList();

        const mapped = res.data.map((v: any) => ({
          id: v.id,
          category: v.issue?.category ?? "기타",
          title: v.question ?? v.title ?? "(제목 없음)",
          description: v.issue?.description ?? "",
          options: v.options ?? [],
          totalVolume: v.totalBets ?? 0,
          participants: v.totalParticipants ?? 0,
          deadline: v.endAt ? v.endAt.substring(0, 10) : "",
          status: v.status === "OPEN" ? "진행중" : "종료",
          trending:
            (v.totalParticipants ?? 0) > 500 ||
            (v.totalBets ?? 0) > 200000,
        }));

        setVoteIssues(mapped);

      } catch (e) {
        console.error("투표 목록 불러오기 실패:", e);
      }
      setLoading(false);
    }

    load();
  }, []);

  /** 🔍 필터링 */
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

        {/* 제목 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">이슈 투표</h1>
            <p className="text-gray-400">
              다양한 이슈를 예측하고 포인트를 획득하세요
            </p>
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
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl 
                       border border-white/20 rounded-2xl text-white"
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
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
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
          <VoteList items={filteredIssues} onMarketClick={onMarketClick} />
        )}

        {/* 검색 결과 없음 */}
        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-300">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 생성 모달 */}
      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
      />
    </div>
  );
}
