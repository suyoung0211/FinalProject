// ⭐⭐⭐⭐⭐ 댓글 추천/비추천 기능 추가된 완성본 ⭐⭐⭐⭐⭐

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";

import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
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
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
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

  // ------------------------------
  // 댓글 추천 / 비추천 기능 추가
  // ------------------------------

  const handleLikeComment = (commentId: string, parentId?: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        // 대댓글 처리
        if (parentId && comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    dislikes: reply.isLiked
                      ? reply.dislikes
                      : reply.isDisliked
                      ? (reply.dislikes || 1) - 1
                      : reply.dislikes,
                    isLiked: !reply.isLiked,
                    isDisliked: false,
                  }
                : reply
            ),
          };
        }

        // 일반 댓글 처리
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            dislikes: comment.isLiked
              ? comment.dislikes
              : comment.isDisliked
              ? (comment.dislikes || 1) - 1
              : comment.dislikes,
            isLiked: !comment.isLiked,
            isDisliked: false,
          };
        }

        return comment;
      })
    );
  };

  const handleDislikeComment = (commentId: string, parentId?: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        // 대댓글 처리
        if (parentId && comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    dislikes: reply.isDisliked
                      ? (reply.dislikes || 1) - 1
                      : (reply.dislikes || 0) + 1,
                    likes: reply.isDisliked
                      ? reply.likes
                      : reply.isLiked
                      ? reply.likes - 1
                      : reply.likes,
                    isDisliked: !reply.isDisliked,
                    isLiked: false,
                  }
                : reply
            ),
          };
        }

        // 일반 댓글 처리
        if (comment.id === commentId) {
          return {
            ...comment,
            dislikes: comment.isDisliked
              ? (comment.dislikes || 1) - 1
              : (comment.dislikes || 0) + 1,
            likes: comment.isDisliked
              ? comment.likes
              : comment.isLiked
              ? comment.likes - 1
              : comment.likes,
            isDisliked: !comment.isDisliked,
            isLiked: false,
          };
        }

        return comment;
      })
    );
  };

  // ------------------------------
  // 댓글 작성
  // ------------------------------
  const requireLogin = () => navigate("/login");

  const handlePostComment = () => {
    if (!user) return requireLogin();
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
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  const handlePostReply = (commentId: string) => {
    if (!user) return requireLogin();
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
      dislikes: 0,
      isLiked: false,
      isDisliked: false,
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
  };

  // ------------------------------
  // 게시글 로딩
  // ------------------------------
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/community/posts/${postId}`);
        setPost(res.data);
      } catch (e) {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        로딩 중...
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-screen text-white p-8">
        <button onClick={() => navigate("/community")} className="mb-4">
          ← 목록으로
        </button>
        {error}
      </div>
    );

  const isMyPost = user && String(user.id) === String(post.authorId);

  return (
    <div className="min-h-screen text-white p-8">
      <button onClick={() => navigate("/community")} className="mb-6">
        ← 목록으로
      </button>

      <div className="max-w-4xl mx-auto">
        {/* 게시글 내용 */}
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="text-sm text-gray-400 flex gap-2 mb-6">
          <span>{post.authorNickname || post.author}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>

        <div className="bg-black/20 p-6 rounded-xl mb-6">
          {post.content}
        </div>

        {/* ------------------------------
            댓글 섹션
        ------------------------------ */}
        <div className="bg-white/5 p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            댓글 {comments.length}
          </h2>

          {/* 댓글 작성 */}
          <div className="mb-8">
            {user ? (
              <div className="space-y-3">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 작성하세요..."
                  className="bg-white/5 text-white"
                />
                <div className="flex justify-end">
                  <Button onClick={handlePostComment}>댓글 작성</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                댓글을 작성하려면 로그인이 필요합니다.
                <Button onClick={requireLogin}>로그인</Button>
              </div>
            )}
          </div>

          {/* 댓글 리스트 */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-white/10 pb-6">
                <div className="flex items-start gap-3">
                  <Avatar
                    type={comment.avatarType || "male"}
                    variant={comment.avatarVariant || 1}
                    size={48}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {comment.authorName}
                      </span>

                      <span className="text-xs text-gray-500">
                        {comment.createdAt}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-3">{comment.content}</p>

                    {/* ------------------------------
                        댓글 추천 / 비추천 버튼
                    ------------------------------ */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-sm ${
                          comment.isLiked
                            ? "text-purple-400"
                            : "text-gray-400 hover:text-purple-400"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {comment.likes}
                      </button>

                      <button
                        onClick={() =>
                          handleDislikeComment(comment.id)
                        }
                        className={`flex items-center gap-1 text-sm ${
                          comment.isDisliked
                            ? "text-red-400"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        {comment.dislikes || 0}
                      </button>

                      <button
                        onClick={() =>
                          setReplyTo(replyTo === comment.id ? null : comment.id)
                        }
                        className="text-sm text-gray-400 hover:text-purple-400"
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
                          className="bg-white/5 text-white text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => setReplyTo(null)}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            disabled={!replyText.trim()}
                            onClick={() => handlePostReply(comment.id)}
                          >
                            답글 작성
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* ------------------------------
                        대댓글 리스트
                    ------------------------------ */}
                    {comment.replies && (
                      <div className="mt-4 ml-8 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar
                              type={reply.avatarType || "male"}
                              variant={reply.avatarVariant || 1}
                              size={36}
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-white">
                                  {reply.authorName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {reply.createdAt}
                                </span>
                              </div>

                              <p className="text-gray-300 text-sm mb-2">
                                {reply.content}
                              </p>

                              {/* 대댓글 추천/비추천 */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleLikeComment(reply.id, comment.id)
                                  }
                                  className={`flex items-center gap-1 text-xs ${
                                    reply.isLiked
                                      ? "text-purple-400"
                                      : "text-gray-400 hover:text-purple-400"
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  {reply.likes}
                                </button>

                                <button
                                  onClick={() =>
                                    handleDislikeComment(reply.id, comment.id)
                                  }
                                  className={`flex items-center gap-1 text-xs ${
                                    reply.isDisliked
                                      ? "text-red-400"
                                      : "text-gray-400 hover:text-red-400"
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  {reply.dislikes || 0}
                                </button>
                              </div>
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
          {/* ▼ 댓글 리스트 끝 */}
        </div>
      </div>
    </div>
  );
}

