import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Flame, Users, Globe, Briefcase, DollarSign, Zap, Star, Award, Search, Plus, Pin, ChevronLeft, ChevronRight, User, Coins, ChevronDown, LogOut, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface CommunityPageProps {
  onBack: () => void;
  onPostClick?: (postId: string) => void;
  onWriteClick?: () => void;
  currentUser?: string;
  onNews?: () => void;
  onLeaderboard?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorName: string;
  authorLevel?: number;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  isHot?: boolean;
  isBest?: boolean;
  tags?: string[];
}

export function CommunityPage({ onBack, onPostClick, onWriteClick, currentUser, onNews, onLeaderboard, onPointsShop, onProfile, user, onLogin, onLogout, onSignup }: CommunityPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'hot'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const maxPages = 10;
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('free');
  const [newPostTags, setNewPostTags] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const categories = [
    { id: 'all', label: '전체', icon: Globe },
    { id: 'prediction', label: '예측 분석', icon: TrendingUp },
    { id: 'strategy', label: '전략 공유', icon: Award },
    { id: 'politics', label: '정치', icon: Users },
    { id: 'business', label: '경제', icon: Briefcase },
    { id: 'crypto', label: '크립토', icon: DollarSign },
    { id: 'sports', label: '스포츠', icon: Zap },
    { id: 'entertainment', label: '엔터', icon: Flame },
    { id: 'free', label: '자유', icon: MessageSquare },
  ];

  const posts: CommunityPost[] = [
    {
      id: '1',
      title: '[공지] Mak\' gora 커뮤니티 이용 가이드',
      content: '커뮤니티 이용 시 지켜주셔야 할 규칙과 팁을 안내드립니다.',
      category: 'free',
      author: 'admin',
      authorName: '운영진',
      authorLevel: 99,
      avatarType: 'male',
      avatarVariant: 1,
      createdAt: '1일 전',
      views: 5234,
      likes: 423,
      comments: 67,
      isPinned: true,
    },
    {
      id: '2',
      title: '비트코인 15만 달러 돌파 예측 - 상세 분석',
      content: '기술적 분석과 온체인 데이터를 기반으로 비트코인의 15만 달러 돌파 가능성을 분석해봤습니다. 현재 주 지표들을 살펴보면...',
      category: 'prediction',
      author: 'crypto_analyst',
      authorName: '크립토 분석가',
      authorLevel: 15,
      avatarType: 'male',
      avatarVariant: 4,
      createdAt: '2시간 전',
      views: 3421,
      likes: 287,
      comments: 89,
      isHot: true,
      isBest: true,
      tags: ['비트코인', '기술적분석', '크립토'],
    },
    {
      id: '3',
      title: '초보자를 위한 포인트 배팅 전략 가이드',
      content: '5000 포인트로 시작해서 3주만에 20000 포인트를 달성한 전략을 공유합니다. 핵심은 리스크 관리와...',
      category: 'strategy',
      author: 'strategy_master',
      authorName: '전략마스터',
      authorLevel: 12,
      avatarType: 'female',
      avatarVariant: 2,
      createdAt: '5시간 전',
      views: 2856,
      likes: 342,
      comments: 124,
      isHot: true,
      tags: ['전략', '초보자', '가이드'],
    },
    {
      id: '4',
      title: '2027 대선 여론조사 데이터 분석',
      content: '최근 3개월간의 여론조사 추이를 그래프로 정리했습니다. 흥미로운 패턴이 발견네요.',
      category: 'politics',
      author: 'data_scientist',
      authorName: '데이터사이언티스트',
      authorLevel: 10,
      avatarType: 'male',
      avatarVariant: 3,
      createdAt: '7시간 전',
      views: 1923,
      likes: 156,
      comments: 78,
      tags: ['정치', '데이터분석', '대선'],
    },
    {
      id: '5',
      title: 'AI 의료 진단 시장 베팅 어떻게 보시나요?',
      content: 'AI가 의사 면허 시험을 통과할 것 같은데, 여러분의 의견이 궁금합니다.',
      category: 'business',
      author: 'ai_enthusiast',
      authorName: 'AI 매니아',
      authorLevel: 8,
      avatarType: 'female',
      avatarVariant: 4,
      createdAt: '9시간 전',
      views: 1567,
      likes: 89,
      comments: 45,
      tags: ['AI', '의료', '비즈니스'],
    },
    {
      id: '6',
      title: '손흥민 150골 달성 확률 99%라고 봅니다',
      content: '현재 폼과 남은 경기 수를 고려하면 거의 확실하다고 생각합니다. 근거는...',
      category: 'sports',
      author: 'soccer_fan',
      authorName: '축구팬',
      authorLevel: 7,
      avatarType: 'male',
      avatarVariant: 2,
      createdAt: '12시간 전',
      views: 2134,
      likes: 198,
      comments: 56,
      isHot: true,
      tags: ['손흥민', '축구', 'EPL'],
    },
    {
      id: '7',
      title: '이더리움 2.0 업그레이드 후 가격 전망',
      content: '업그레이드가 성공적으로 완료되었는데, 이제 가격은 어떻게 될까요? 역사적 패턴을 분석해봤습니다.',
      category: 'crypto',
      author: 'eth_holder',
      authorName: 'ETH 홀더',
      authorLevel: 11,
      avatarType: 'female',
      avatarVariant: 1,
      createdAt: '14시간 전',
      views: 1876,
      likes: 167,
      comments: 92,
      tags: ['이더리움', '크립토', '업그레이드'],
    },
    {
      id: '8',
      title: '블랙핑크 제니 솔로 앨범 대박 예상',
      content: '팬덤 규모와 이전 솔로곡 성과를 보면 차트 1위는 확실할 것 같아요.',
      category: 'entertainment',
      author: 'kpop_lover',
      authorName: 'K-POP 러버',
      authorLevel: 6,
      avatarType: 'female',
      avatarVariant: 3,
      createdAt: '16시간 전',
      views: 2456,
      likes: 234,
      comments: 67,
      tags: ['블랙핑크', '제니', 'K-POP'],
    },
    {
      id: '9',
      title: '포인트 잃고 멘탈 회복하는 법',
      content: '어제 1000포인트 날렸는데 오늘 다시 회복했습니다. 제 경험을 공유합니다.',
      category: 'free',
      author: 'comeback_king',
      authorName: '컴백킹',
      authorLevel: 9,
      avatarType: 'male',
      avatarVariant: 1,
      createdAt: '18시간 전',
      views: 1234,
      likes: 145,
      comments: 34,
      tags: ['멘탈관리', '경험담'],
    },
    {
      id: '10',
      title: '코스피 3000선 돌파 vs 실패 토론',
      content: '여러분은 어느 쪽에 베팅하셨나요? 이유도 함께 공유해주세요!',
      category: 'business',
      author: 'stock_trader',
      authorName: '주식트레이더',
      authorLevel: 13,
      avatarType: 'male',
      avatarVariant: 4,
      createdAt: '1일 전',
      views: 1678,
      likes: 123,
      comments: 89,
      tags: ['주식', '코스피', '토론'],
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes;
      case 'hot':
        return (b.likes + b.comments) - (a.likes + a.comments);
      default:
        return 0; // latest - already in order
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prediction':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'strategy':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'politics':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'business':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'crypto':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'sports':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'entertainment':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.label || category;
  };

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
                    onClick={onPointsShop}
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

      <div className="container mx-auto px-4 py-8 pt-24">{/* pt-24 for header spacing */}
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">커뮤니티</h1>
          </div>
          <p className="text-gray-400">예측 전문가들과 소통하고 전략을 공유하세요</p>
        </div>

        {/* Search and Actions */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
              />
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-6" onClick={() => onWriteClick && onWriteClick()}>
              <Plus className="w-5 h-5 mr-2" />
              글쓰기
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 max-w-5xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-full transition-all ${
                sortBy === 'latest'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-full transition-all ${
                sortBy === 'popular'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => setSortBy('hot')}
              className={`px-4 py-2 rounded-full transition-all ${
                sortBy === 'hot'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              HOT
            </button>
          </div>
          <div className="text-sm text-gray-400">
            총 <span className="text-white font-bold">{filteredPosts.length}</span>개의 게시글
          </div>
        </div>

        {/* Posts List */}
        <div className="max-w-5xl mx-auto space-y-3">
          {sortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage).map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick && onPostClick(post.id)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 hover:bg-white/10 transition-all group text-left"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  {post.avatarType && post.avatarVariant ? (
                    <Avatar type={post.avatarType} variant={post.avatarVariant} size={48} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title with badges */}
                  <div className="flex items-start gap-2 mb-2">
                    {post.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                    )}
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors flex-1">
                      {post.title}
                    </h3>
                    {post.isBest && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold flex-shrink-0">
                        <Star className="w-3 h-3" />
                        BEST
                      </span>
                    )}
                    {post.isHot && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex-shrink-0">
                        <Flame className="w-3 h-3" />
                        HOT
                      </span>
                    )}
                  </div>

                  {/* Content preview */}
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md bg-white/5 text-gray-400 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </span>
                        <span className="text-sm text-white font-medium">{post.authorName}</span>
                        {post.authorLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold">
                            Lv.{post.authorLevel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{post.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-pink-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  이전
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(Math.ceil(filteredPosts.length / postsPerPage), maxPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.min(Math.ceil(filteredPosts.length / postsPerPage), maxPages)))}
                  disabled={currentPage >= Math.min(Math.ceil(filteredPosts.length / postsPerPage), maxPages)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  다음
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              {/* Page Info */}
              <div className="text-center mt-3 text-sm text-gray-400">
                <span className="text-white font-bold">{currentPage}</span> / {Math.min(Math.ceil(filteredPosts.length / postsPerPage), maxPages)} 페이지
                <span className="mx-2">•</span>
                총 <span className="text-white font-bold">{filteredPosts.length}</span>개의 게시글
              </div>
            </div>
          </div>
        )}

        {/* Community Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">1,234</div>
            <div className="text-sm text-gray-400">전체 게시글</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">8,567</div>
            <div className="text-sm text-gray-400">활성 회원</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <ThumbsUp className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">45.2K</div>
            <div className="text-sm text-gray-400">총 좋아요</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">156</div>
            <div className="text-sm text-gray-400">오늘의 HOT</div>
          </div>
        </div>
      </div>

      {/* Write Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">새 게시글 작성</h2>
              <button 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg" 
                onClick={() => {
                  setShowWriteModal(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setNewPostCategory('free');
                  setNewPostTags('');
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">제목</label>
                <Input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">카테고리</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.filter(c => c.id !== 'all').map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setNewPostCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          newPostCategory === category.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">내용</label>
                <Textarea
                  placeholder="내용을 입력하세요"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[200px] resize-none"
                  rows={8}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">태그</label>
                <Input
                  type="text"
                  placeholder="태그를 쉼표(,)로 구분하여 입력하세요 (예: 비트코인, 분석, 크립토)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                />
                {newPostTags && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {newPostTags.split(',').map((tag, index) => (
                      tag.trim() && (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs"
                        >
                          #{tag.trim()}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowWriteModal(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setNewPostCategory('free');
                  setNewPostTags('');
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-12 px-6"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  // Here you would normally save the post
                  console.log('New post:', {
                    title: newPostTitle,
                    content: newPostContent,
                    category: newPostCategory,
                    tags: newPostTags.split(',').map(t => t.trim()).filter(t => t),
                  });
                  setShowWriteModal(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setNewPostCategory('free');
                  setNewPostTags('');
                }}
                disabled={!newPostTitle || !newPostContent}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                작성 완료
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}