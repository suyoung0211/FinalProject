import { TrendingUp, Flame, Clock, Globe, Briefcase, Zap, Users, DollarSign, ArrowRight, LogIn, Search, Filter, ShoppingBag, User, Coins, ChevronDown, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
// import headerBanner from 'figma:asset/3c5c32ad58521f0458ddaa92581808acfdcd9748.png';

interface UserProfile {
  username: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface MainPageProps {
  onStart: () => void;
  onLogin: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onMarketClick?: (marketId: string) => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onLeaderboard?: () => void;
  onNews?: () => void;
  onCommunity?: () => void;
  onVote?: () => void;
  user?: UserProfile | null;
}

interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  trending?: boolean;
}

export function MainPage({ onStart, onLogin, onSignup, onLogout, onMarketClick, onPointsShop, onProfile, onLeaderboard, onNews, onCommunity, onVote, user }: MainPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showStore, setShowStore] = useState(false);

  const categories = [
    { id: 'all', label: '전체', icon: Globe },
    { id: 'politics', label: '정치', icon: Users },
    { id: 'business', label: '경제', icon: Briefcase },
    { id: 'crypto', label: '크립토', icon: DollarSign },
    { id: 'sports', label: '스포츠', icon: Zap },
    { id: 'entertainment', label: '엔터', icon: Flame },
  ];

  const markets: Market[] = [
    {
      id: '1',
      question: '2025년 비트코인이 15만 달러를 돌파할까요?',
      category: 'crypto',
      yesPrice: 67,
      noPrice: 33,
      volume: '$2.4M',
      endDate: '2025년 12월 31일',
      trending: true,
    },
    {
      id: '2',
      question: '다음 대선에서 여당이 승리할까요?',
      category: 'politics',
      yesPrice: 52,
      noPrice: 48,
      volume: '$1.8M',
      endDate: '2027년 3월 9일',
      trending: true,
    },
    {
      id: '3',
      question: 'AI가 2025년 내에 의사 면허 시험을 통과할까요?',
      category: 'business',
      yesPrice: 78,
      noPrice: 22,
      volume: '$890K',
      endDate: '2025년 12월 31일',
    },
    {
      id: '4',
      question: '손흥민이 이번 시즌 20골 이상을 기록할까요?',
      category: 'sports',
      yesPrice: 45,
      noPrice: 55,
      volume: '$650K',
      endDate: '2025년 5월 25일',
    },
    {
      id: '5',
      question: 'Tesla 주가가 2025년 내 500달러를 돌파할까요?',
      category: 'business',
      yesPrice: 61,
      noPrice: 39,
      volume: '$1.2M',
      endDate: '2025년 12월 31일',
      trending: true,
    },
    {
      id: '6',
      question: 'BTS가 2025년에 완전체 컴백을 할까요?',
      category: 'entertainment',
      yesPrice: 34,
      noPrice: 66,
      volume: '$780K',
      endDate: '2025년 12월 31일',
    },
    {
      id: '7',
      question: '이더리움이 비트코인을 시가총액으 추월할까요?',
      category: 'crypto',
      yesPrice: 23,
      noPrice: 77,
      volume: '$1.5M',
      endDate: '2026년 12월 31일',
    },
    {
      id: '8',
      question: '2025년 한국 경제성장률이 3%를 넘을까요?',
      category: 'business',
      yesPrice: 41,
      noPrice: 59,
      volume: '$420K',
      endDate: '2026년 1월 31일',
    },
  ];

  const filteredMarkets = markets.filter(market => {
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const trendingMarkets = markets.filter(m => m.trending);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Mak' gora</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Navigation Menu - Always visible */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <button 
                  onClick={() => {
                    if (user) {
                      if (onVote) onVote();
                    } else {
                      onLogin();
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
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
                  onClick={() => {
                    if (user) {
                      if (onNews) onNews();
                    } else {
                      onLogin();
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  뉴스
                </button>
                <button 
                  onClick={() => {
                    if (user) {
                      if (onLeaderboard) onLeaderboard();
                    } else {
                      onLogin();
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  리더보드
                </button>
                <button 
                  onClick={() => {
                    if (user) {
                      if (onPointsShop) onPointsShop();
                    } else {
                      onLogin();
                    }
                  }}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  포인트 상점
                </button>
              </nav>

              {user ? (
                <>
                  {/* Points Display */}
                  <button
                    onClick={() => {
                      if (onPointsShop) onPointsShop();
                    }}
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
                    onClick={() => onSignup ? onSignup() : onLogin()}
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur rounded-full border border-purple-500/30 mb-6">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-purple-200 font-medium">실시간 예측 시장</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            미래의 이슈에<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              투표하고 예측하세요
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            정치, 경제, 스포츠, 엔터테인먼트까지<br />
            다양한 이슈에 대한 집단 지성의 예측을 확인하세요
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="이슈 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-12"
              />
            </div>
            <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 h-12 px-6">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Trending Section */}
        {selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">트렌딩 이슈</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {trendingMarkets.map((market) => (
                <MarketCard 
                  key={market.id} 
                  market={market} 
                  featured 
                  onClick={() => onMarketClick?.(market.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Markets */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? '모든 이슈' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <span className="text-gray-400">({filteredMarkets.length})</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard 
                key={market.id} 
                market={market}
                onClick={() => onMarketClick?.(market.id)}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">$8.2M</div>
            <div className="text-gray-400">총 거래량</div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">24,891</div>
            <div className="text-gray-400">활성 사용자</div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">156</div>
            <div className="text-gray-400">진행 중인 이슈</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketCard({ market, featured = false, onClick }: { market: Market; featured?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group ${
      featured ? 'ring-2 ring-purple-500/50' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {market.question}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{market.endDate}</span>
          </div>
        </div>
        {market.trending && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">HOT</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-4 transition-all group/btn"
        >
          <div className="text-green-400 font-medium text-sm mb-1">YES</div>
          <div className="text-2xl font-bold text-white">{market.yesPrice}%</div>
          <div className="text-xs text-green-300 mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">
            투표하기
          </div>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl p-4 transition-all group/btn"
        >
          <div className="text-red-400 font-medium text-sm mb-1">NO</div>
          <div className="text-2xl font-bold text-white">{market.noPrice}%</div>
          <div className="text-xs text-red-300 mt-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">
            투표하기
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-400">
          <DollarSign className="w-4 h-4" />
          <span>거래량: {market.volume}</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
        >
          자세히 보기 →
        </button>
      </div>
    </div>
  );
}