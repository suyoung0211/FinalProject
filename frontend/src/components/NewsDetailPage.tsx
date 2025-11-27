import { TrendingUp, User, Coins, ChevronDown, LogOut, ShoppingBag, ArrowLeft, Clock, Share2, Bookmark, ThumbsUp, MessageCircle, Eye, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CreateVoteModal } from './CreateVoteModal';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface NewsDetailPageProps {
  onBack: () => void;
  onCommunity?: () => void;
  onLeaderboard?: () => void;
  onPointsShop?: () => void;
  onProfile?: () => void;
  onVote?: () => void;
  onNews?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onSignup?: () => void;
  newsId?: string;
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

interface RelatedNews {
  id: number;
  title: string;
  image?: string;
  timeAgo: string;
}

export function NewsDetailPage({ 
  onBack, 
  onCommunity, 
  onLeaderboard, 
  onPointsShop, 
  onProfile, 
  onVote,
  onNews,
  user, 
  onLogin, 
  onLogout, 
  onSignup,
  newsId 
}: NewsDetailPageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);
  const [newVote, setNewVote] = useState({
    title: '',
    category: '정치',
    deadline: '',
  });

  // 샘플 뉴스 데이터
  const newsArticle = {
    id: 1,
    category: '크립토',
    title: '비트코인, 10만 달러 돌파... 기관 투자자들의 관심 집중',
    summary: '비트코인이 사상 최고가인 10만 달러를 돌파하며 암호화폐 시장이 다시 한번 뜨거운 관심을 받고 있다.',
    content: `비트코인이 사상 최고가인 10만 달러를 돌파하며 암호화폐 시장이 다시 한번 뜨거운 관심을 받고 있다. 기관 투자자들의 대규모 매수세가 이어지면서 암호화폐 시장 전반이 상승세를 보이고 있다.

업계 전문가들은 이번 상승이 단순한 투기가 아닌 실제 가치에 기반한 것이라고 분석하고 있다. 특히 미국의 대형 기관 투자자들이 비트코인을 포트폴리오에 편입하면서 시장의 안정성이 높아지고 있다는 평가다.

블록체인 애널리스트 김철수 씨는 "비트코인 ETF 승인 이후 기관 투자자들의 진입이 가속화되고 있다"며 "이는 암호화폐가 주류 금융 자산으로 자리잡아가고 있다는 신호"라고 말했다.

시장 전문가들은 비트코인이 올해 말까지 15만 달러까지 상승할 가능성이 있다고 전망하고 있다. 다만 변동성이 큰 자산인 만큼 투자자들의 신중한 접근이 필요하다고 조언했다.

한편, 이더리움을 비롯한 주요 알트코인들도 동반 상승하며 암호화폐 시장 전체 시가총액이 3조 달러를 돌파했다. 업계는 이번 상승세가 당분간 지속될 것으로 보고 있다.

규제 당국은 암호화폐 시장의 급격한 성장에 대해 신중한 입장을 유지하면서도, 블록체인 기술의 발전 가능성은 인정하고 있다. 금융위원회 관계자는 "투자자 보호를 위한 제도적 장치를 마련하면서도 혁신을 저해하지 않는 균형잡힌 정책을 추진하겠다"고 밝혔다.`,
    source: 'CryptoNews',
    author: '김기자',
    publishedAt: '2025-11-26 09:30',
    timeAgo: '1시간 전',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80',
    views: 15847,
    likes: 2341,
    comments: 156,
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'crypto_master',
      content: '드디어 10만불 돌파! 다음은 15만불이다 🚀',
      timeAgo: '30분 전',
      likes: 45,
      isLiked: false,
    },
    {
      id: 2,
      author: 'investment_pro',
      content: '기관 투자자들의 진입은 긍정적이지만, 단기 조정은 있을 수 있으니 주의해야 합니다.',
      timeAgo: '45분 전',
      likes: 32,
      isLiked: false,
    },
    {
      id: 3,
      author: 'blockchain_fan',
      content: '비트코인의 미래는 밝습니다. 장기 보유가 답이죠!',
      timeAgo: '1시간 전',
      likes: 28,
      isLiked: false,
    },
  ]);

  const relatedNews: RelatedNews[] = [
    {
      id: 2,
      title: '이더리움 2.0 업그레이드 완료... 수수료 90% 감소',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80',
      timeAgo: '2시간 전',
    },
    {
      id: 3,
      title: '미국 SEC, 비트코인 ETF 추가 승인... 시장 확대 기대',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
      timeAgo: '3시간 전',
    },
    {
      id: 4,
      title: '크립토 거래소, 신규 상장 코인 발표... 투자자 관심 집중',
      timeAgo: '5시간 전',
    },
  ];

  const handleCommentSubmit = () => {
    if (!user) {
      onLogin?.();
      return;
    }
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: user.name,
      content: commentText,
      timeAgo: '방금 전',
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        };
      }
      return comment;
    }));
  };

  const handleCreateVote = () => {
    if (!newVote.title || !newVote.deadline) {
      alert('제목과 마감일을 입력해주세요.');
      return;
    }
    // 투표 생성 로직
    setShowCreateVoteModal(false);
    setNewVote({ title: '', category: '정치', deadline: '' });
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
                  onClick={onVote}
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
                  onClick={onNews}
                  className="text-purple-400 font-medium"
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>뒤로가기</span>
            </button>

            {/* Article */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              {/* Featured Image */}
              {newsArticle.image && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={newsArticle.image}
                    alt={newsArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Category */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                    {newsArticle.category}
                  </span>
                </div>

                {/* Article Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {newsArticle.timeAgo}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {newsArticle.views.toLocaleString()}
                  </div>
                  <span>•</span>
                  <span>{newsArticle.author}</span>
                </div>

                {/* Title */}
                <h1 className="text-white text-3xl font-bold mb-4">
                  {newsArticle.title}
                </h1>

                {/* Tags and Create Vote Button */}
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    #비트코인
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    #암호화폐
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10">
                    #ETF
                  </span>
                  
                  {user && (
                    <button
                      onClick={() => setShowCreateVoteModal(true)}
                      className="ml-2 px-3 py-1 rounded-full text-xs bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 text-purple-300 hover:from-purple-600/40 hover:to-pink-600/40 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      투표 만들기
                    </button>
                  )}
                </div>

                {/* Summary */}
                <p className="text-gray-300 mb-6 p-4 bg-purple-600/10 rounded-lg border border-purple-500/20">
                  {newsArticle.summary}
                </p>

                {/* Article Content */}
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-8">
                  {newsArticle.content}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                  <Button
                    onClick={() => setIsLiked(!isLiked)}
                    variant={isLiked ? 'default' : 'outline'}
                    className={isLiked 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                      : 'border-white/20 hover:bg-white/10'
                    }
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    좋아요 {(newsArticle.likes + (isLiked ? 1 : 0)).toLocaleString()}
                  </Button>
                  <Button
                    onClick={() => setIsSaved(!isSaved)}
                    variant="outline"
                    className={isSaved 
                      ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10' 
                      : 'border-white/20 hover:bg-white/10'
                    }
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? '저장됨' : '저장'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    공유
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                댓글 {comments.length}
              </h2>

              {/* Comment Input */}
              <div className="mb-8">
                {user ? (
                  <div className="space-y-3">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="댓글을 작성하세요..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                      >
                        댓글 작성
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-gray-400 mb-4">댓글을 작성하려면 로그인이 필요합니다</p>
                    <Button
                      onClick={onLogin}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      로그인
                    </Button>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-white/10 pb-6 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                        </div>
                        <p className="text-gray-300 mb-3">{comment.content}</p>
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 text-sm transition-colors ${
                            comment.isLiked ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related News */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4">관련 뉴스</h3>
              <div className="space-y-4">
                {relatedNews.map((news) => (
                  <button
                    key={news.id}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                  >
                    {news.image && (
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="text-white text-sm mb-2 line-clamp-2">{news.title}</p>
                    <p className="text-xs text-gray-500">{news.timeAgo}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Space */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-sm">광고 영역</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Vote Modal */}
      {showCreateVoteModal && (
        <CreateVoteModal
          isOpen={showCreateVoteModal}
          onClose={() => setShowCreateVoteModal(false)}
          onCreate={(voteData) => {
            console.log('New vote created:', voteData);
            alert(`투표가 생성되었습니다!\n질문: ${voteData.question}\n카테고리: ${voteData.category}\n종료일: ${voteData.endDate}`);
          }}
        />
      )}
    </div>
  );
}