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

// 🔥 백엔드 CommunityCommentResponse 기준으로 타입 정의
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

  replies: Comment[];

  // (옵션) 아바타 표시용 UI 전용 필드
  avatarType?: "male" | "female";
  avatarVariant?: number;
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 이제 댓글은 백엔드와 동기화
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const requireLogin = () => navigate("/login");

  // --------------------------------
  // 📌 게시글 추천/비추천 (그대로 사용)
  // --------------------------------
  const handleLikePost = async () => {
  if (!user) return requireLogin();
  if (!post || !postId) return;

  try {
    const res = await api.post(`/community/posts/${postId}/reactions`, {
      reactionValue: post.myReaction === 1 ? 0 : 1,
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
    console.error("게시글 추천 처리 실패", e);
  }
};

  const handleDislikePost = async () => {
  if (!user) return requireLogin();
  if (!post || !postId) return;

  try {
    const res = await api.post(`/community/posts/${postId}/reactions`, {
      reactionValue: post.myReaction === -1 ? 0 : -1,
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
    console.error("게시글 비추천 처리 실패", e);
  }
};


  // --------------------------------
  // 📌 댓글 추천/비추천 (지금은 프론트 로컬)
  //    → 나중에 백엔드 연동되면 API 호출로 바꾸면 됨
  // --------------------------------
  const handleLikeComment = async (commentId: number) => {
  if (!user) return requireLogin();

  try {
    await api.post(`/community/comments/${commentId}/like`);
    await loadComments();  // 최신 데이터 다시 불러오기
  } catch (e) {
    console.error("댓글 추천 실패", e);
  }
};

  const handleDislikeComment = async (commentId: number) => {
  if (!user) return requireLogin();

  try {
    await api.post(`/community/comments/${commentId}/dislike`);
    await loadComments();  // 최신 데이터 다시 불러오기
  } catch (e) {
    console.error("댓글 비추천 실패", e);
  }
};

  // --------------------------------
  // 📌 댓글/대댓글 로딩 함수 (백엔드 연동)
  // --------------------------------
  const loadComments = async () => {
  if (!postId) return;

  try {
    const res = await api.get(`/community/posts/${postId}/comments`);
    const data = res.data as Comment[];

    // 아바타용 임시 필드 추가
    const withAvatar: Comment[] = data.map((c) => ({
      ...c,
      avatarType: "male",     // UI용 임시 값
      avatarVariant: 1,
      replies: (c.replies ?? []).map((r) => ({
        ...r,
        avatarType: "male",
        avatarVariant: 1,
      })),
    }));

    setComments(withAvatar);
  } catch (e) {
    console.error("댓글 불러오기 실패", e);
  }
};

  // --------------------------------
  // 📌 댓글 작성 (루트 댓글, 백엔드 연동)
  // --------------------------------
  const handlePostComment = async () => {
    if (!user) return requireLogin();
    if (!commentText.trim() || !postId) return;

    try {
      await api.post(`/community/posts/${postId}/comments`, {
        content: commentText,
        parentCommentId: null,
      });

      setCommentText("");
      await loadComments();
    } catch (e) {
      console.error("댓글 작성 실패", e);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  // --------------------------------
  // 📌 대댓글 작성 (백엔드 연동)
  // --------------------------------
  const handlePostReply = async (parentCommentId: number) => {
    if (!user) return requireLogin();
    if (!replyText.trim() || !postId) return;

    try {
      await api.post(`/community/posts/${postId}/comments`, {
        content: replyText,
        parentCommentId,
      });

      setReplyText("");
      setReplyTo(null);
      await loadComments();
    } catch (e) {
      console.error("대댓글 작성 실패", e);
      alert("대댓글 작성 중 오류가 발생했습니다.");
    }
  };

  // 댓글 수정 시작
const startEditComment = (comment: Comment) => {
  if (!user) return requireLogin();
  // 본인 댓글만
  if (!comment.mine) return;

  setEditingCommentId(comment.commentId);
  setEditText(comment.content);
};

// 수정 취소
const cancelEditComment = () => {
  setEditingCommentId(null);
  setEditText("");
};

// 댓글 수정 제출
const submitEditComment = async (commentId: number) => {
  if (!user) return requireLogin();
  if (!editText.trim()) return;

  try {
    await api.put(`/community/comments/${commentId}`, {
      content: editText,
    });

    setEditingCommentId(null);
    setEditText("");
    await loadComments();
  } catch (e) {
    console.error("댓글 수정 실패", e);
    alert("댓글 수정 중 오류가 발생했습니다.");
  }
};

// 댓글 삭제
const deleteComment = async (commentId: number) => {
  if (!user) return requireLogin();

  if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

  try {
    await api.delete(`/community/comments/${commentId}`);
    await loadComments();
  } catch (e) {
    console.error("댓글 삭제 실패", e);
    alert("댓글 삭제 중 오류가 발생했습니다.");
  }
};


  // --------------------------------
  // 📌 게시글 로딩
  // --------------------------------
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/community/posts/${postId}`);
        const data = res.data as any;

        const myReaction: number = data.myReaction ?? 0;

        setPost({
          ...data,
          myReaction,
          isLiked: myReaction === 1,
          isDisliked: myReaction === -1,
        });
      } catch (e) {
        console.error(e);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // 📌 댓글은 별도로 로딩
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        로딩 중...
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-screen p-8 text-white">
        <button onClick={() => navigate("/community")} className="mb-4">
          ← 목록으로
        </button>
        {error || "게시글이 존재하지 않습니다."}
      </div>
    );

  const isMyPost = user && String(user.nickname) === String(post.authorId);

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

        <div className="bg-black/20 p-6 rounded-xl mb-6 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* 게시글 추천/비추천 버튼 */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={handleLikePost}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              post.isLiked
                ? "border-purple-400 text-purple-400"
                : "border-gray-500 text-gray-300 hover:text-purple-300"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            추천 {post.recommendationCount ?? 0}
          </button>

          <button
            onClick={handleDislikePost}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
              post.isDisliked
                ? "border-red-400 text-red-400"
                : "border-gray-500 text-gray-300 hover:text-red-300"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            비추천 {post.dislikeCount ?? 0}
          </button>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white/5 p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            댓글 {comments.length}
          </h2>

          {/* 댓글 작성 */}
          {user ? (
            <div className="mb-8">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 작성하세요..."
                className="bg-white/5 text-white"
              />
              <div className="flex justify-end mt-3">
                <Button onClick={handlePostComment}>댓글 작성</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              댓글 작성하려면 로그인이 필요합니다.
              <Button onClick={requireLogin} className="ml-2">
                로그인
              </Button>
            </div>
          )}

          {/* 댓글 리스트 (백엔드 데이터 기반) */}
          <div className="space-y-8">
                    {comments.map((comment) => (
          <div
            key={comment.commentId}
            className="border-b border-white/10 pb-6"
          >
            <div className="flex gap-3">
              <Avatar
                type={comment.avatarType || "male"}
                variant={comment.avatarVariant || 1}
                size={48}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* 🔧 수정 모드 vs 일반 모드 */}
                {editingCommentId === comment.commentId ? (
                  <div className="mb-3 space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-white/5 text-white text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={cancelEditComment}>
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => submitEditComment(comment.commentId)}
                      >
                        수정 완료
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 mb-3">{comment.content}</p>
                )}

                {/* 댓글 추천/비추천 + 답글 + (본인일 때만) 수정/삭제 */}
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => handleLikeComment(comment.commentId)}
                    className={`flex items-center gap-1 text-sm ${
                      comment.likeCount > 0
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-purple-400"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {comment.likeCount}
                  </button>

                  <button
                    onClick={() => handleDislikeComment(comment.commentId)}
                    className={`flex items-center gap-1 text-sm ${
                      comment.dislikeCount > 0
                        ? "text-red-400"
                        : "text-gray-400 hover:text-red-400"
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    {comment.dislikeCount}
                  </button>

                  <button
                    onClick={() =>
                      setReplyTo(
                        replyTo === comment.commentId ? null : comment.commentId
                      )
                    }
                    className="text-sm text-gray-400 hover:text-purple-400"
                  >
                    답글
                  </button>

                  {/* 🔥 내 댓글일 때만 */}
                  {comment.mine && (
                    <>
                      <button
                        onClick={() => startEditComment(comment)}
                        className="text-sm text-gray-400 hover:text-blue-400"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteComment(comment.commentId)}
                        className="text-sm text-gray-400 hover:text-red-400"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>

                {/* 대댓글 작성 */}
                {replyTo === comment.commentId && user && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 작성하세요..."
                      className="bg-white/5 text-white text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => setReplyTo(null)}>
                        취소
                      </Button>
                      <Button
                        size="sm"
                        disabled={!replyText.trim()}
                        onClick={() => handlePostReply(comment.commentId)}
                      >
                        답글 작성
                      </Button>
                    </div>
                  </div>
                )}

                {/* 대댓글 리스트 */}
                {comment.replies?.length ? (
                  <div className="mt-4 ml-10 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.commentId} className="flex gap-3">
                        <Avatar
                          type={reply.avatarType || "male"}
                          variant={reply.avatarVariant || 1}
                          size={36}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm">
                              {reply.nickname}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {editingCommentId === reply.commentId ? (
                            <div className="mb-2 space-y-2">
                              <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="bg-white/5 text-white text-sm"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditComment}
                                >
                                  취소
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    submitEditComment(reply.commentId)
                                  }
                                >
                                  수정 완료
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-300 text-sm mb-2">
                              {reply.content}
                            </p>
                          )}

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                handleLikeComment(reply.commentId)
                              }
                              className={`flex items-center gap-1 text-xs ${
                                reply.likeCount > 0
                                  ? "text-purple-400"
                                  : "text-gray-400 hover:text-purple-400"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {reply.likeCount}
                            </button>

                            <button
                              onClick={() =>
                                handleDislikeComment(reply.commentId)
                              }
                              className={`flex items-center gap-1 text-xs ${
                                reply.dislikeCount > 0
                                  ? "text-red-400"
                                  : "text-gray-400 hover:text-red-400"
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              {reply.dislikeCount}
                            </button>

                            {/* 대댓글도 내 거면 수정/삭제 */}
                            {reply.mine && (
                              <>
                                <button
                                  onClick={() => startEditComment(reply)}
                                  className="text-xs text-gray-400 hover:text-blue-400"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => deleteComment(reply.commentId)}
                                  className="text-xs text-gray-400 hover:text-red-400"
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
                ) : null}
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
