import { TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag, Vote, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { fetchVoteList } from '../api/voteApi';
import { useNavigate } from "react-router-dom";

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
  status: string;
  trending?: boolean;
}

interface VoteListPageProps {
  onBack?: () => void;
  onCommunity?: () => void;
  onNews?: () => void;
  onLeaderboard?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onMarketClick?: (marketId: string) => void;
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

export function VoteListPage({
  onBack,
  onCommunity,
  onNews,
  onLeaderboard,
  onPointsShop,
  onProfile,
  onMarketClick,
  user,
  onLogin,
  onLogout,
  onSignup
}: VoteListPageProps) {

  const navigate = useNavigate();

  const [voteIssues, setVoteIssues] = useState<VoteIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // 📌 투표 리스트 불러오기
  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      const data = await fetchVoteList();

      const mapped: VoteIssue[] = data.map((v: any) => ({
        id: v.voteId,
        category: v.category || "기타",
        title: v.title,
        description: v.description || "",
        yesPercentage: v.yesPercent ?? 50,
        noPercentage: v.noPercent ?? 50,
        totalVolume: v.totalPoints ?? 0,
        participants: v.totalParticipants ?? 0,
        deadline: v.endAt?.split("T")[0],
        status: v.status === "ONGOING" ? "진행중" : "종료",
        trending: v.trending ?? false,
      }));

      setVoteIssues(mapped);
    } catch (err) {
      console.error("투표 리스트 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['전체', '정치', '경제', '크립토', '스포츠', '엔터테인먼트', '기술', '사회'];
  const statuses = ['전체', '진행중', '종료'];

  const filteredIssues = voteIssues.filter(issue => {
    const categoryMatch = selectedCategory === "전체" || issue.category === selectedCategory;
    const statusMatch = selectedStatus === "전체" || issue.status === selectedStatus;
    const searchMatch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && statusMatch && searchMatch;
  });

  if (loading) return <div className="text-white p-10 text-center">로딩중...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* ---------------- Header ---------------- */}
      {/* ---------------- Header ---------------- */}
<header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Mak' gora</span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* 네비게이션 메뉴 */}
        <nav className="hidden md:flex items-center gap-6 mr-4">
          <button onClick={() => navigate("/vote")} className="text-purple-400 font-medium">
            투표
          </button>
          <button onClick={() => navigate("/community")} className="text-gray-300 hover:text-white transition-colors font-medium">
            커뮤니티
          </button>
          <button onClick={() => navigate("/news")} className="text-gray-300 hover:text-white transition-colors font-medium">
            뉴스
          </button>
          <button onClick={() => navigate("/leaderboard")} className="text-gray-300 hover:text-white transition-colors font-medium">
            리더보드
          </button>
          <button onClick={() => navigate("/shop")} className="text-gray-300 hover:text-white transition-colors font-medium">
            포인트 상점
          </button>
        </nav>

        {/* 로그인 / 유저 메뉴 */}
        {user ? (
          <>
            {/* 포인트 */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              <Coins className="w-5 h-5 text-white" />
              <span className="text-white font-bold">{user.points.toLocaleString()} P</span>
            </button>

            {/* 유저 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:block text-white font-medium">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="text-white font-semibold">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>내 프로필</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate("/signup")}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              회원가입
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              로그인
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

      {/* ---------------- Content ---------------- */}
      <div className="container mx-auto px-4 py-8 pt-24">

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이슈 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">

          {/* ---------------- 카테고리 & 투표 생성 버튼 ---------------- */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm font-medium">카테고리</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* --- 투표 생성 버튼 추가됨 --- */}
            <Button
              onClick={() => navigate("/vote/create")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700"
            >
              + 투표 생성
            </Button>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-medium">상태</span>
            </div>
            <div className="flex items-center gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- Vote List Grid ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              onClick={() => onMarketClick?.(String(issue.id))}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                  {issue.category}
                </span>
                {issue.trending && (
                  <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 인기
                  </span>
                )}
              </div>

              <h3 className="text-white font-bold text-lg mb-2">{issue.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{issue.description}</p>

              <div className="space-y-3 mb-4">
                {/* YES */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-green-400 font-medium text-sm">YES</span>
                    <span className="text-green-400 font-bold">{issue.yesPercentage}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: `${issue.yesPercentage}%` }} />
                  </div>
                </div>

                {/* NO */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-400 font-medium text-sm">NO</span>
                    <span className="text-red-400 font-bold">{issue.noPercentage}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${issue.noPercentage}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-4">
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

              <div className="mt-4 pt-4 border-t border-white/10">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarketClick?.(String(issue.id));
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  투표하기
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-16 text-white">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoteListPage;
