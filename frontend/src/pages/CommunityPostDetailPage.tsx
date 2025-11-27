import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";

// 댓글 UI에 필요한 아이콘 & 컴포넌트들
import { MessageSquare, ThumbsUp } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

type PostDetail = {
  postId: number;
  title: string;
  content: string;
  postType: string;
  authorId: number;
  author: string;
  authorNickname?: string;
  createdAt: string;
  recommendationCount?: number;
  commentCount?: number;
};

type Comment = {
  id: string;
  author: string;
  authorName: string;
  authorLevel?: number;
  avatarType?: "male" | "female";
  avatarVariant?: number;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 댓글 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // ⭐ baseURL이 /api 이므로 여기에는 /community/... 만 적기
        const res = await api.get(`/community/posts/${postId}`);
        setPost(res.data);

        // TODO: 나중에 댓글 API 연동 시 여기에서 댓글도 같이 불러오기
        // const commentRes = await api.get(`/community/posts/${postId}/comments`);
        // setComments(commentRes.data);
      } catch (e) {
        console.error("게시글 조회 실패", e);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const requireLogin = () => {
    navigate("/login");
  };

  // 댓글 좋아요
  const handleLikeComment = (commentId: string, parentId?: string) => {
    if (parentId) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId && comment.replies
            ? {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                        isLiked: !reply.isLiked,
                      }
                    : reply
                ),
              }
            : comment
        )
      );
    } else {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked,
              }
            : comment
        )
      );
    }
  };

  // 댓글 작성
  const handlePostComment = () => {
    if (!user) {
      requireLogin();
      return;
    }
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: String(user.id),
      authorName: (user as any).nickname || user.email || "익명",
      authorLevel: 1,
      avatarType: "male",
      avatarVariant: 1,
      content: commentText,
      createdAt: "방금 전",
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");

    // TODO: 나중에 백엔드로 POST /community/posts/:postId/comments 보내기
  };

  // 대댓글 작성
  const handlePostReply = (commentId: string) => {
    if (!user) {
      requireLogin();
      return;
    }
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: `${commentId}-${Date.now()}`,
      author: String(user.id),
      authorName: (user as any).nickname || user.email || "익명",
      authorLevel: 1,
      avatarType: "male",
      avatarVariant: 1,
      content: replyText,
      createdAt: "방금 전",
      likes: 0,
      isLiked: false,
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );

    setReplyText("");
    setReplyTo(null);

    // TODO: 나중에 백엔드로 POST /community/posts/:postId/comments/:commentId/replies
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900">
        <button
          onClick={() => navigate("/community")}
          className="mb-4 text-purple-300 hover:text-purple-200"
        >
          ← 목록으로
        </button>
        <div>{error || "게시글이 존재하지 않습니다."}</div>
      </div>
    );
  }

  const isMyPost = user && String(user.id) === String(post.authorId);
  const authorName = post.authorNickname || post.author || "알 수 없음";

  return (
    <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900">
      <button
        onClick={() => navigate("/community")}
        className="text-purple-300 hover:text-purple-200 mb-6"
      >
        ← 목록으로
      </button>

      <div className="max-w-4xl mx-auto">
        {/* 게시글 내용 */}
        <h1 className="mt-4 text-3xl font-bold mb-4">{post.title}</h1>

        <div className="mt-2 text-sm text-gray-400 flex gap-2 items-center mb-6">
          <span>{authorName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
          {typeof post.recommendationCount === "number" && (
            <>
              <span>·</span>
              <span>추천 {post.recommendationCount}</span>
            </>
          )}
          {typeof post.commentCount === "number" && (
            <>
              <span>·</span>
              <span>댓글 {post.commentCount}</span>
            </>
          )}
        </div>

        <div className="mt-8 whitespace-pre-wrap leading-relaxed bg-black/20 rounded-xl p-6 mb-6">
          {post.content}
        </div>

        {isMyPost && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => navigate(`/community/edit/${post.postId}`)}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
            >
              수정하기
            </button>
            <button
              onClick={() => navigate("/community")}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
            >
              목록으로
            </button>
          </div>
        )}

        {/* 🔽 댓글 섹션 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mt-10">
          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            댓글 {comments.length}
          </h2>

          {/* 댓글 입력 */}
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
                <p className="text-gray-400 mb-4">
                  댓글을 작성하려면 로그인이 필요합니다
                </p>
                <Button
                  onClick={requireLogin}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  로그인
                </Button>
              </div>
            )}
          </div>

          {/* 댓글 리스트 */}
          <div className="space-y-6">
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm">
                아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
              </p>
            )}

            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-white/10 pb-6 last:border-0"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    type={comment.avatarType || "male"}
                    variant={comment.avatarVariant || 1}
                    size={48}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {comment.authorName}
                      </span>
                      {comment.authorLevel && (
                        <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          Lv.{comment.authorLevel}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{comment.content}</p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          comment.isLiked
                            ? "text-purple-400"
                            : "text-gray-400 hover:text-purple-400"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() =>
                          setReplyTo(
                            replyTo === comment.id ? null : comment.id
                          )
                        }
                        className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        답글
                      </button>
                    </div>

                    {/* 답글 입력 */}
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

                    {/* 대댓글 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-8 space-y-4">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-3"
                          >
                            <Avatar
                              type={reply.avatarType || "male"}
                              variant={reply.avatarVariant || 1}
                              size={36}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white text-sm font-medium">
                                  {reply.authorName}
                                </span>
                                {reply.authorLevel && (
                                  <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                    Lv.{reply.authorLevel}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {reply.createdAt}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">
                                {reply.content}
                              </p>
                              <button
                                onClick={() =>
                                  handleLikeComment(reply.id, comment.id)
                                }
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.isLiked
                                    ? "text-purple-400"
                                    : "text-gray-400 hover:text-purple-400"
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
        {/* 댓글 섹션 끝 */}
      </div>
    </div>
  );
}
