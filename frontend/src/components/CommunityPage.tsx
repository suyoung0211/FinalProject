import { MessageSquare, ThumbsUp, Eye, Clock, TrendingUp, Flame, Users, Globe, Briefcase, DollarSign, Zap, Star, Award, Search, Plus, Pin, ChevronLeft, ChevronRight, User, Coins, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Avatar } from './Avatar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import api from '../api/api';

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

interface ApiCommunityPost {
  postId: number;
  title: string;
  content: string;
  postType: string;
  recommendationCount?: number;
  commentCount?: number;
  authorLevel?: number;
  createdAt: string; // ISO 문자열
  author: string; // 백엔드 Response DTO의 필드명
}

// 백엔드 postType → 프론트 카테고리 id 매핑
const postTypeToCategory: Record<string, string> = {
  '이슈추천': 'prediction',  // 백엔드: '이슈추천' → 프론트: 'prediction'
  '포인트자랑': 'strategy',  // 백엔드: '포인트자랑' → 프론트: 'strategy'
  '일반': 'free',            // 백엔드: '일반' → 프론트: 'free'
};

export function CommunityPage({
  onBack,
  onPostClick,
  onWriteClick,
  currentUser,
  onNews,
  onLeaderboard,
  onPointsShop,
  onProfile,
  user,
  onLogin,
  onLogout,
  onSignup,
}: CommunityPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'hot'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const maxPages = 10;
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

  // 🔹 실제 게시글 상태
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // 🔹 처음 로딩될 때 백엔드에서 게시글 목록 조회
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('📤 게시글 목록 조회 요청...');
        const res = await api.get<ApiCommunityPost[]>('/community/posts');
        console.log('✅ 게시글 목록 조회 성공:', res.data);

        const mapped: CommunityPost[] = res.data.map((p) => ({
          id: p.postId.toString(),
          title: p.title,
          content: p.content,
          category: postTypeToCategory[p.postType] ?? 'free',
          author: '', // 필요하면 나중에 userId 추가
          authorName: p.author, // 백엔드 Response의 'author' 필드 사용
          authorLevel: p.authorLevel ?? undefined,
          avatarType: undefined,
          avatarVariant: undefined,
          createdAt: new Date(p.createdAt).toLocaleString('ko-KR', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          views: 0, // 아직 조회수 없으니 0
          likes: p.recommendationCount ?? 0,
          comments: p.commentCount ?? 0,
          isPinned: false,
          isHot: false,
          isBest: false,
          tags: [],
        }));

        console.log('📋 매핑된 게시글 수:', mapped.length);
        setPosts(mapped);
      } catch (error: any) {
        console.error('❌ 커뮤니티 게시글 목록 불러오기 실패:', error);
        console.error('   - 상태 코드:', error.response?.status);
        console.error('   - 에러 메시지:', error.response?.data);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        return b.likes + b.comments - (a.likes + a.comments);
      default:
        return 0; // latest - 이미 배열 순서대로
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
                <button className="text-purple-400 font-medium">커뮤니티</button>
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
                    <span className="text-white font-bold">
                      {user.points.toLocaleString()} P
                    </span>
                  </button>

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="hidden sm:block text-white font-medium">
                        {user.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          showProfileMenu ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">
                                {user.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                            <Coins className="w-4 h-4 text-white" />
                            <span className="text-white font-bold">
                              {user.points.toLocaleString()} 포인트
                            </span>
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
                    onClick={() =>
                      onSignup ? onSignup() : onLogin && onLogin()
                    }
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

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">커뮤니티</h1>
          </div>
          <p className="text-gray-400">
            예측 전문가들과 소통하고 전략을 공유하세요
          </p>
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
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-6"
              onClick={() => onWriteClick && onWriteClick()}
            >
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
            총 <span className="text-white font-bold">{filteredPosts.length}</span>
            개의 게시글
          </div>
        </div>

        {/* Posts List */}
        <div className="max-w-5xl mx-auto space-y-3">
          {sortedPosts
            .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
            .map((post) => (
              <button
                key={post.id}
                onClick={() => onPostClick && onPostClick(post.id)}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-500/50 hover:bg-white/10 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    {post.avatarType && post.avatarVariant ? (
                      <Avatar
                        type={post.avatarType}
                        variant={post.avatarVariant}
                        size={48}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
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

                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>

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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getCategoryColor(
                              post.category,
                            )}`}
                          >
                            {getCategoryLabel(post.category)}
                          </span>
                          <span className="text-sm text-white font-medium">
                            {post.authorName}
                          </span>
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
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  이전
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    {
                      length: Math.min(
                        Math.ceil(filteredPosts.length / postsPerPage),
                        maxPages,
                      ),
                    },
                    (_, i) => i + 1,
                  ).map((page) => (
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

                <Button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.min(
                          Math.ceil(filteredPosts.length / postsPerPage),
                          maxPages,
                        ),
                      ),
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.min(
                      Math.ceil(filteredPosts.length / postsPerPage),
                      maxPages,
                    )
                  }
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-10 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  다음
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              <div className="text-center mt-3 text-sm text-gray-400">
                <span className="text-white font-bold">{currentPage}</span> /{' '}
                {Math.min(
                  Math.ceil(filteredPosts.length / postsPerPage),
                  maxPages,
                )}{' '}
                페이지
                <span className="mx-2">•</span>
                총{' '}
                <span className="text-white font-bold">
                  {filteredPosts.length}
                </span>
                개의 게시글
              </div>
            </div>
          </div>
        )}

        {/* Community Stats (하드코딩 유지) */}
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
    </div>
  );
}
