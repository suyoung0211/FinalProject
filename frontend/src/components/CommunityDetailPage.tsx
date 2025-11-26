import { ArrowLeft, MessageSquare, ThumbsUp, Eye, Clock, Share2, Bookmark, MoreVertical, User, Coins, ChevronDown, LogOut, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
}

interface CommunityDetailPageProps {
  onBack: () => void;
  postId?: string;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
}

interface Comment {
  id: string;
  author: string;
  authorName: string;
  authorLevel?: number;
  avatarType?: 'male' | 'female';
  avatarVariant?: number;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface Post {
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
  isLiked?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
}

export function CommunityDetailPage({ onBack, postId, user, onLogin, onLogout, onProfile }: CommunityDetailPageProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Mock post data - 실제로는 postId로 데이터를 가져와야 합니다
  const [post, setPost] = useState<Post>({
    id: postId || '2',
    title: '비트코인 15만 달러 돌파 예측 - 상세 분석',
    content: `기술적 분석과 온체인 데이터를 기반으로 비트코인의 15만 달러 돌파 가능성을 분석해봤습니다.

현재 주요 지표들을 살펴보면:

1. **온체인 지표**
   - 거래소 유입량이 지속적으로 감소하고 있습니다
   - Long-term holder들의 비중이 70%를 넘어섰습니다
   - MVRV 비율이 건강한 수준을 유지하고 있습니다

2. **기술적 분석**
   - 200일 이동평균선이 강력한 지지선 역할을 하고 있습니다
   - RSI가 과매수 구간에 진입하지 않았습니다
   - 볼린저 밴드가 확장되는 모습을 보이고 있습니다

3. **매크로 환경**
   - 현물 ETF 순유입이 지속되고 있습니다
   - 기관 투자자들의 관심이 증가하고 있습니다
   - 규제 환경이 개선되는 추세입니다

결론적으로 현재 추세가 유지된다면 올해 말까지 15만 달러 돌파가 충분히 가능하다고 생각합니다.

여러분의 생각은 어떠신가요?`,
    category: 'prediction',
    author: 'crypto_analyst',
    authorName: '크립토 분석가',
    authorLevel: 15,
    avatarType: 'male',
    avatarVariant: 4,
    createdAt: '2시간 전',
    views: 3421,
    likes: 287,
    isLiked: false,
    isBookmarked: false,
    tags: ['비트코인', '기술적분석', '크립토'],
  });

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'trader123',
      authorName: '트레이더123',
      authorLevel: 8,
      avatarType: 'male',
      avatarVariant: 2,
      content: '상세한 분석 감사합니다! 특히 온체인 데이터 부분이 인상적이네요. 저도 비슷한 생각을 하고 있었습니다.',
      createdAt: '1시간 전',
      likes: 24,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          author: 'crypto_analyst',
          authorName: '크립토 분석가',
          authorLevel: 15,
          avatarType: 'male',
          avatarVariant: 4,
          content: '감사합니다! 앞으로도 유용한 분석 공유하겠습니다.',
          createdAt: '50분 전',
          likes: 8,
          isLiked: false,
        },
      ],
    },
    {
      id: '2',
      author: 'hodler_pro',
      authorName: '장기보유러',
      authorLevel: 12,
      avatarType: 'female',
      avatarVariant: 3,
      content: '15만 달러는 보수적인 예측인 것 같습니다. 20만 달러도 충분히 가능하다고 봅니다.',
      createdAt: '45분 전',
      likes: 18,
      isLiked: false,
    },
    {
      id: '3',
      author: 'newbie_investor',
      authorName: '초보투자자',
      authorLevel: 3,
      avatarType: 'male',
      avatarVariant: 1,
      content: 'MVRV 비율이 정확히 무엇인가요? 초보자도 이해할 수 있게 설명해주시면 감사하겠습니다!',
      createdAt: '30분 전',
      likes: 5,
      isLiked: false,
      replies: [
        {
          id: '3-1',
          author: 'crypto_analyst',
          authorName: '크립토 분석가',
          authorLevel: 15,
          avatarType: 'male',
          avatarVariant: 4,
          content: 'MVRV는 Market Value to Realized Value의 약자로, 현재 시가총액을 실현 시가총액으로 나눈 비율입니다. 간단히 말하면 평균적으로 사람들이 얼마나 수익을 보고 있는지를 나타내는 지표입니다!',
          createdAt: '25분 전',
          likes: 12,
          isLiked: false,
        },
      ],
    },
  ]);

  const handleLikePost = () => {
    setPost({
      ...post,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      isLiked: !post.isLiked,
    });
  };

  const handleBookmark = () => {
    setPost({
      ...post,
      isBookmarked: !post.isBookmarked,
    });
  };

  const handleLikeComment = (commentId: string, parentId?: string) => {
    if (parentId) {
      // Handle reply like
      setComments(comments.map(comment => {
        if (comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      }));
    } else {
      // Handle comment like
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
    }
  };

  const handlePostComment = () => {
    if (!user) {
      onLogin?.();
      return;
    }
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: user.id,
      authorName: user.name,
      authorLevel: 5,
      avatarType: 'male',
      avatarVariant: 1,
      content: commentText,
      createdAt: '방금 전',
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handlePostReply = (commentId: string) => {
    if (!user) {
      onLogin?.();
      return;
    }
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: `${commentId}-${Date.now()}`,
      author: user.id,
      authorName: user.name,
      authorLevel: 5,
      avatarType: 'male',
      avatarVariant: 1,
      content: replyText,
      createdAt: '방금 전',
      likes: 0,
      isLiked: false,
    };

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      return comment;
    }));

    setReplyText('');
    setReplyTo(null);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'prediction': '예측 분석',
      'strategy': '전략 공유',
      'politics': '정치',
      'business': '경제',
      'crypto': '크립토',
      'sports': '스포츠',
      'entertainment': '엔터',
      'free': '자유',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">뒤로가기</span>
              </button>
            </div>

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">{user.name}</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-600/20 rounded-full">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-bold">{user.points.toLocaleString()}P</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onProfile?.();
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      프로필
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout?.();
                      }}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={onLogin}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Post Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-6">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
              {getCategoryLabel(post.category)}
            </span>
            {post.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-white text-3xl font-bold mb-6">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar
                type={post.avatarType || 'male'}
                variant={post.avatarVariant || 1}
                size={72}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{post.authorName}</span>
                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                    Lv.{post.authorLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{post.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{comments.length}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 text-gray-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
            <Button
              onClick={handleLikePost}
              variant={post.isLiked ? 'default' : 'outline'}
              className={post.isLiked 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : 'border-white/20 hover:bg-white/10'
              }
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              좋아요 {post.likes}
            </Button>
            <Button
              onClick={handleBookmark}
              variant="outline"
              className={post.isBookmarked 
                ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10' 
                : 'border-white/20 hover:bg-white/10'
              }
            >
              <Bookmark className={`w-4 h-4 mr-2 ${post.isBookmarked ? 'fill-current' : ''}`} />
              북마크
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

        {/* Comments Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
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
                    onClick={handlePostComment}
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
                {/* Comment Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    type={comment.avatarType || 'male'}
                    variant={comment.avatarVariant || 1}
                    size={48}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{comment.authorName}</span>
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                        Lv.{comment.authorLevel}
                      </span>
                      <span className="text-xs text-gray-500">{comment.createdAt}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{comment.content}</p>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          comment.isLiked ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        답글
                      </button>
                    </div>

                    {/* Reply Input */}
                    {replyTo === comment.id && user && (
                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 작성하세요..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setReplyTo(null)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 hover:bg-white/10"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={() => handlePostReply(comment.id)}
                            disabled={!replyText.trim()}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                          >
                            답글 작성
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-8 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar
                              type={reply.avatarType || 'male'}
                              variant={reply.avatarVariant || 1}
                              size={36}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium">{reply.authorName}</span>
                                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                  Lv.{reply.authorLevel}
                                </span>
                                <span className="text-xs text-gray-500">{reply.createdAt}</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{reply.content}</p>
                              <button
                                onClick={() => handleLikeComment(reply.id, comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.isLiked ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}