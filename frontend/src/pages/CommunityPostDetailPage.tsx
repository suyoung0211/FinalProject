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
  dislikeCount?: number;

  myReaction?: number;
  isLiked?: boolean;
  isDisliked?: boolean;

  commentCount?: number;
};

type Comment = {
  commentId: number;
  postId: number;
  parentCommentId: number | null;

  userId: number;
  nickname: string;

  content: string;
  createdAt: string;
  updatedAt: string;

  likeCount: number;
  dislikeCount: number;

  mine: boolean;

  likedByMe?: boolean;
  dislikedByMe?: boolean;

  replies: Comment[];

  avatarType?: "male" | "female";
  avatarVariant?: number;
};

// 댓글 트리 재귀 매핑
function mapComment(c: Comment): Comment {
  return {
    ...c,
    avatarType: c.avatarType ?? "male",
    avatarVariant: c.avatarVariant ?? 1,
    replies: (c.replies ?? []).map((r) => mapComment(r)),
  };
}

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const requireLogin = () => navigate("/login");

  // 🔥 댓글/대댓글을 개별 업데이트하는 헬퍼
  const updateComment = (commentId: number, update: Partial<Comment>) => {
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? { ...c, ...update }
          : {
              ...c,
              replies: c.replies.map((r) =>
                r.commentId === commentId ? { ...r, ...update } : r
              ),
            }
      )
    );
  };

  // 🔥 게시글 추천
  const handleLikePost = async () => {
    if (!user) return requireLogin();
    if (!postId) return;

    try {
      const res = await api.post(`/community/posts/${postId}/reactions`, {
        reactionValue: post?.myReaction === 1 ? 0 : 1,
      });

      const data = res.data;

      setPost((prev) =>
        prev
          ? {
              ...prev,
              recommendationCount: data.recommendationCount,
              dislikeCount: data.dislikeCount,
              myReaction: data.myReaction,
              isLiked: data.myReaction === 1,
              isDisliked: data.myReaction === -1,
            }
          : prev
      );
    } catch (e) {
      console.error("게시글 추천 실패", e);
    }
  };

  // 🔥 게시글 비추천
  const handleDislikePost = async () => {
    if (!user) return requireLogin();
    if (!postId) return;

    try {
      const res = await api.post(`/community/posts/${postId}/reactions`, {
        reactionValue: post?.myReaction === -1 ? 0 : -1,
      });

      const data = res.data;

      setPost((prev) =>
        prev
          ? {
              ...prev,
              recommendationCount: data.recommendationCount,
              dislikeCount: data.dislikeCount,
              myReaction: data.myReaction,
              isLiked: data.myReaction === 1,
              isDisliked: data.myReaction === -1,
            }
          : prev
      );
    } catch (e) {
      console.error("게시글 비추천 실패", e);
    }
  };

  // 🔥 댓글 추천
  const handleLikeComment = async (commentId: number) => {
    if (!user) return requireLogin();

    try {
      const res = await api.post(`/community/comments/${commentId}/like`);
      const data = res.data;

      updateComment(commentId, {
        likeCount: data.likeCount,
        dislikeCount: data.dislikeCount,
        likedByMe: data.likedByMe,
        dislikedByMe: data.dislikedByMe,
      });
    } catch (e) {
      console.error("댓글 추천 실패", e);
    }
  };

  // 🔥 댓글 비추천
  const handleDislikeComment = async (commentId: number) => {
    if (!user) return requireLogin();

    try {
      const res = await api.post(`/community/comments/${commentId}/dislike`);
      const data = res.data;

      updateComment(commentId, {
        likeCount: data.likeCount,
        dislikeCount: data.dislikeCount,
        likedByMe: data.likedByMe,
        dislikedByMe: data.dislikedByMe,
      });
    } catch (e) {
      console.error("댓글 비추천 실패", e);
    }
  };

  // 댓글 로딩
  const loadComments = async () => {
    try {
      const res = await api.get(`/community/posts/${postId}/comments`);
      setComments(res.data.map((c: Comment) => mapComment(c)));
    } catch (e) {
      console.error("댓글 불러오기 실패", e);
    }
  };

  // 댓글 작성
  const handlePostComment = async () => {
    if (!user) return requireLogin();
    if (!commentText.trim()) return;

    try {
      await api.post(`/community/posts/${postId}/comments`, {
        content: commentText,
        parentCommentId: null,
      });
      setCommentText("");
      loadComments();
    } catch (e) {
      console.error("댓글 작성 실패", e);
    }
  };

  // 대댓글 작성
  const handlePostReply = async (parentCommentId: number) => {
    if (!user) return requireLogin();
    if (!replyText.trim()) return;

    try {
      await api.post(`/community/posts/${postId}/comments`, {
        content: replyText,
        parentCommentId,
      });

      setReplyText("");
      setReplyTo(null);
      loadComments();
    } catch (e) {
      console.error("대댓글 작성 실패", e);
    }
  };

  // 댓글 수정
  const startEditComment = (comment: Comment) => {
    if (!comment.mine) return;
    setEditingCommentId(comment.commentId);
    setEditText(comment.content);
  };

  const submitEditComment = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      await api.put(`/community/comments/${commentId}`, {
        content: editText,
      });

      setEditingCommentId(null);
      setEditText("");
      loadComments();
    } catch (e) {
      console.error("댓글 수정 실패", e);
    }
  };

  // 삭제
  const deleteComment = async (commentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/community/comments/${commentId}`);
      loadComments();
    } catch (e) {
      console.error("댓글 삭제 실패", e);
    }
  };

  // 게시글 로딩
  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await api.get(`/community/posts/${postId}`);
        const data = res.data;
        const myReaction = data.myReaction ?? 0;

        setPost({
          ...data,
          myReaction,
          isLiked: myReaction === 1,
          isDisliked: myReaction === -1,
        });
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
    loadComments();
  }, [postId]);

  if (loading) return <div className="text-white">로딩중...</div>;
  if (error || !post) return <div className="text-white">{error}</div>;

  return (
    <div className="min-h-screen text-white p-8">
      <button onClick={() => navigate("/community")} className="mb-6">
        ← 목록으로
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="text-sm text-gray-400 mb-6">
          {post.authorNickname} · {new Date(post.createdAt).toLocaleString()}
        </div>

        <div className="bg-black/20 p-6 rounded-xl mb-6 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* 게시글 추천 */}
<div className="flex gap-4">
  <button
    onClick={handleLikePost}
    className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
      post.isLiked ? "border-purple-400 text-purple-400" : "border-gray-500 text-gray-300"
    }`}
  >
    <ThumbsUp className="w-4 h-4" />
    추천 {post.recommendationCount ?? 0}
  </button>

  <button
    onClick={handleDislikePost}
    className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
      post.isDisliked ? "border-red-400 text-red-400" : "border-gray-500 text-gray-300"
    }`}
  >
    <ThumbsDown className="w-4 h-4" />
    비추천 {post.dislikeCount ?? 0}
  </button>
</div>

        {/* 댓글 섹션 */}
        <div className="mt-10 bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-6">댓글 {comments.length}</h2>

          {/* 댓글 작성 */}
          {user && (
            <div className="mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <div className="flex justify-end mt-2">
                <Button onClick={handlePostComment}>작성</Button>
              </div>
            </div>
          )}

          {/* 댓글 리스트 */}
          <div className="space-y-8">
            {comments.map((comment) => (
              <div key={comment.commentId}>
                <div className="flex gap-3">
                  <Avatar
                    type={comment.avatarType ?? "male"}
                    variant={comment.avatarVariant ?? 1}
                    size={48}
                  />

                  <div className="flex-1">
                    <div className="text-white font-medium">{comment.nickname}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>

                    {/* 수정 또는 본문 */}
                    {editingCommentId === comment.commentId ? (
                      <>
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={() => submitEditComment(comment.commentId)}>
                            저장
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingCommentId(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-300 mt-2">{comment.content}</p>
                    )}

                    {/* 댓글 버튼 */}
                    <div className="flex gap-4 mt-3">
                      <button
                        onClick={() => handleLikeComment(comment.commentId)}
                        className={`text-sm ${
                          comment.likedByMe ? "text-purple-400" : "text-gray-400"
                        }`}
                      >
                        <ThumbsUp className="inline w-3 h-3" /> {comment.likeCount}
                      </button>

                      <button
                        onClick={() => handleDislikeComment(comment.commentId)}
                        className={`text-sm ${
                          comment.dislikedByMe ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        <ThumbsDown className="inline w-3 h-3" /> {comment.dislikeCount}
                      </button>

                      <button
                        className="text-sm text-gray-400"
                        onClick={() =>
                          setReplyTo(replyTo === comment.commentId ? null : comment.commentId)
                        }
                      >
                        답글
                      </button>

                      {comment.mine && (
                        <>
                          <button
                            onClick={() => startEditComment(comment)}
                            className="text-sm text-blue-400"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => deleteComment(comment.commentId)}
                            className="text-sm text-red-400"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>

                    {/* 대댓글 작성 */}
                    {replyTo === comment.commentId && (
                      <div className="ml-10 mt-3">
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="답글을 입력하세요"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button onClick={() => handlePostReply(comment.commentId)}>
                            작성
                          </Button>
                          <Button variant="outline" onClick={() => setReplyTo(null)}>
                            취소
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 대댓글 렌더링 */}
                    {comment.replies.length > 0 && (
                      <div className="ml-10 mt-4 space-y-6">
                        {comment.replies.map((reply) => (
                          <div key={reply.commentId} className="flex gap-3">
                            <Avatar
                              type={reply.avatarType ?? "male"}
                              variant={reply.avatarVariant ?? 1}
                              size={36}
                            />

                            <div className="flex-1">
                              <div className="text-white text-sm">{reply.nickname}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleString()}
                              </div>

                              <p className="text-gray-300 mt-1 text-sm">
                                {reply.content}
                              </p>

                              <div className="flex gap-3 mt-2">
                                <button
                                  onClick={() => handleLikeComment(reply.commentId)}
                                  className={`text-xs ${
                                    reply.likedByMe ? "text-purple-400" : "text-gray-400"
                                  }`}
                                >
                                  <ThumbsUp className="inline w-3 h-3" />{" "}
                                  {reply.likeCount}
                                </button>

                                <button
                                  onClick={() => handleDislikeComment(reply.commentId)}
                                  className={`text-xs ${
                                    reply.dislikedByMe ? "text-red-400" : "text-gray-400"
                                  }`}
                                >
                                  <ThumbsDown className="inline w-3 h-3" />{" "}
                                  {reply.dislikeCount}
                                </button>

                                {reply.mine && (
                                  <>
                                    <button
                                      onClick={() => startEditComment(reply)}
                                      className="text-xs text-blue-300"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => deleteComment(reply.commentId)}
                                      className="text-xs text-red-300"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
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
        </div>
      </div>
    </div>
  );
}
