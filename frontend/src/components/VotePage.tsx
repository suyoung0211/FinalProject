import { TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag, Vote, Filter, Search, TrendingDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { CreateVoteModal } from './CreateVoteModal';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface VotePageProps {
  onBack: () => void;
  onCommunity?: () => void;
  onNews?: () => void;
  onLeaderboard?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onMarketClick?: (marketId: string) => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

type VoteCategory = '전체' | '정치' | '경제' | '크립토' | '스포츠' | '엔터테인먼트' | '기술' | '사회';
type VoteStatus = '전체' | '진행중' | '종료';

interface VoteIssue {
  id: number;
  category: VoteCategory;
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

export function VotePage({ 
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
}: VotePageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VoteCategory>('전체');
  const [selectedStatus, setSelectedStatus] = useState<VoteStatus>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  const categories: VoteCategory[] = ['전체', '정치', '경제', '크립토', '스포츠', '엔터테인먼트', '기술', '사회'];
  const statuses: VoteStatus[] = ['전체', '진행중', '종료'];

  const voteIssues: VoteIssue[] = [
    {
      id: 1,
      category: '정치',
      title: '2025년 대선, 여당 후보가 승리할 것인가?',
      description: '2025년 대통령 선거에서 여당 후보가 당선될 것으로 예상하십니까?',
      yesPercentage: 58,
      noPercentage: 42,
      totalVolume: 125000,
      participants: 1847,
      deadline: '2025-03-09',
      status: '진행중',
      trending: true,
    },
    {
      id: 2,
      category: '크립토',
      title: '비트코인이 2025년 말까지 15만 달러를 돌파할 것인가?',
      description: '비트코인 가격이 2025년 12월 31일까지 $150,000를 넘을 것으로 예상하십니까?',
      yesPercentage: 72,
      noPercentage: 28,
      totalVolume: 289000,
      participants: 3254,
      deadline: '2025-12-31',
      status: '진행중',
      trending: true,
    },
    {
      id: 3,
      category: '경제',
      title: '한국은행이 2025년 상반기 금리를 인하할 것인가?',
      description: '2025년 6월까지 한국은행이 기준금리를 인하할 것으로 예상하십니까?',
      yesPercentage: 45,
      noPercentage: 55,
      totalVolume: 87000,
      participants: 967,
      deadline: '2025-06-30',
      status: '진행중',
    },
    {
      id: 4,
      category: '스포츠',
      title: '손흥민이 2024-25 시즌 프리미어리그 득점왕을 차지할 것인가?',
      description: '손흥민 선수가 2024-25 프리미어리그 시즌 득점왕에 오를 것으로 예상하십니까?',
      yesPercentage: 34,
      noPercentage: 66,
      totalVolume: 156000,
      participants: 2134,
      deadline: '2025-05-25',
      status: '진행중',
      trending: true,
    },
    {
      id: 5,
      category: '기술',
      title: 'OpenAI가 2025년 상반기에 GPT-5를 출시할 것인가?',
      description: 'OpenAI가 2025년 6월 30일까지 GPT-5 모델을 공식 출시할 것으로 예상하십니까?',
      yesPercentage: 81,
      noPercentage: 19,
      totalVolume: 234000,
      participants: 2876,
      deadline: '2025-06-30',
      status: '진행중',
      trending: true,
    },
    {
      id: 6,
      category: '엔터테인먼트',
      title: 'BTS가 2025년 완전체로 컴백할 것인가?',
      description: 'BTS가 2025년 내에 7명 전원이 모여 완전체 활동을 재개할 것으로 예상하십니까?',
      yesPercentage: 67,
      noPercentage: 33,
      totalVolume: 198000,
      participants: 3421,
      deadline: '2025-12-31',
      status: '진행중',
    },
    {
      id: 7,
      category: '사회',
      title: '서울 아파트 평균 가격이 2025년 말까지 15억을 넘을 것인가?',
      description: '서울 지역 아파트 평균 거래가가 2025년 12월까지 15억 원을 초과할 것으로 예상하십니까?',
      yesPercentage: 52,
      noPercentage: 48,
      totalVolume: 143000,
      participants: 1654,
      deadline: '2025-12-31',
      status: '진행중',
    },
    {
      id: 8,
      category: '정치',
      title: '국회가 2025년 상반기에 헌법 개정안을 통과시킬 것인가?',
      description: '국회가 2025년 6월까지 헌법 개정안을 의결할 것으로 예상하십니까?',
      yesPercentage: 23,
      noPercentage: 77,
      totalVolume: 67000,
      participants: 845,
      deadline: '2025-06-30',
      status: '진행중',
    },
    {
      id: 9,
      category: '크립토',
      title: '이더리움이 2025년에 비트코인보다 높은 수익률을 기록할 것인가?',
      description: '2025년 한 해 동안 이더리움의 가격 상승률이 비트코인을 초과할 것으로 예상하십니까?',
      yesPercentage: 61,
      noPercentage: 39,
      totalVolume: 176000,
      participants: 2234,
      deadline: '2025-12-31',
      status: '진행중',
    },
    {
      id: 10,
      category: '경제',
      title: '코스피가 2025년 3,500선을 돌파할 것인가?',
      description: '코스피 지수가 2025년 내에 3,500포인트를 돌파할 것으로 예상하십니까?',
      yesPercentage: 69,
      noPercentage: 31,
      totalVolume: 112000,
      participants: 1432,
      deadline: '2025-12-31',
      status: '진행중',
    },
  ];

  // 필터링 로직
  const filteredIssues = voteIssues.filter(issue => {
    const categoryMatch = selectedCategory === '전체' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === '전체' || issue.status === selectedStatus;
    const searchMatch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <button onClick={onBack} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Mak' gora</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <button 
                  className="text-purple-400 font-medium"
                >
                  투표
                </button>
                <button 
                  onClick={onCommunity}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  커뮤니티
                </button>
                <button 
                  onClick={onNews}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  뉴스
                </button>
                <button 
                  onClick={onLeaderboard}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  리더보드
                </button>
                <button 
                  onClick={onPointsShop}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  포인트 상점
                </button>
              </nav>

              {user ? (
                <>
                  {/* Points Display */}
                  <button
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Coins className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">{user.points.toLocaleString()} P</span>
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block text-white font-medium">{user.name}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{user.name}</div>
                              <div className="text-gray-400 text-sm">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                            <Coins className="w-4 h-4 text-white" />
                            <span className="text-white font-bold">{user.points.toLocaleString()} 포인트</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onProfile) onProfile();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            <span>프로필</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onPointsShop) onPointsShop();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>포인트 상점</span>
                          </button>
                        </div>
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              if (onLogout) onLogout();
                            }}
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
                    onClick={() => onSignup ? onSignup() : onLogin && onLogin()}
                    variant="ghost" 
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    회원가입
                  </Button>
                  <Button 
                    onClick={onLogin}
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Page Title & Search */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">이슈 투표</h1>
              <p className="text-gray-400">다양한 이슈에 대한 예측에 참여하고 포인트를 획득하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full">
                <Vote className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{filteredIssues.length}개의 투표</span>
              </div>
              {user && (
                <Button
                  onClick={() => setShowCreateVoteModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">투표 생성</span>
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="이슈 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-medium">카테고리</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
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

          {/* Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm font-medium">상태</span>
            </div>
            <div className="flex items-center gap-2">
              {statuses.map((status) => (
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

        {/* Vote Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onMarketClick && onMarketClick(issue.id.toString())}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                    {issue.category}
                  </span>
                  {issue.trending && (
                    <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      인기
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  issue.status === '진행중'
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {issue.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                {issue.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {issue.description}
              </p>

              {/* Vote Bars */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-medium text-sm">YES</span>
                    <span className="text-green-400 font-bold">{issue.yesPercentage}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
                      style={{ width: `${issue.yesPercentage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-400 font-medium text-sm">NO</span>
                    <span className="text-red-400 font-bold">{issue.noPercentage}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all"
                      style={{ width: `${issue.noPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 text-sm text-gray-400">
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

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarketClick && onMarketClick(issue.id.toString());
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  투표하기
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Vote className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-400">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </div>

      {/* Create Vote Modal */}
      <CreateVoteModal
        isOpen={showCreateVoteModal}
        onClose={() => setShowCreateVoteModal(false)}
      />
    </div>
  );
}