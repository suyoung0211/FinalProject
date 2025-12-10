import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";
import DOMPurify from "dompurify";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import ProfileAvatar from "./ProfileAvatar";

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
  mine?: boolean;
  likedByMe?: boolean;
  dislikedByMe?: boolean;
  replies: Comment[];
  avatarType?: "male" | "female";
  avatarVariant?: number;
  avatarIcon?: string;
  profileFrame?: string;
  profileBadge?: string;
};

interface FileUploadResponse {
  fileId: number;
  postId: number;
  fileType: "IMAGE" | "VIDEO";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

// 댓글 트리 재귀 매핑
function mapComment(c: Comment): Comment {
  return {
    ...c,
    avatarType: c.avatarType ?? "male",
    avatarVariant: c.avatarVariant ?? 1,
    replies: (c.replies ?? []).map((r) => mapComment(r)),
  };
}

/** ⭐ 게시글 본문 + 이미지/동영상 + 추천/비추천 전용 컴포넌트 */
type PostBodyProps = {
  post: PostDetail;
  currentUserId: number | null;
  onLike: () => void;
  onDislike: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const PostBody = memo(function PostBody({
  post,
  currentUserId,
  onLike,
  onDislike,
  onEdit,
  onDelete,
}: PostBodyProps) {
  // 🔥 post.content가 바뀔 때에만 DOMPurify 실행
  const sanitizedContent = useMemo(
    () =>
      DOMPurify.sanitize(post.content || "", {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "strike",
          "img",
          "video",
          "a",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "code",
          "pre",
          "span",
          "div",
        ],
        ALLOWED_ATTR: [
          "src",
          "alt",
          "href",
          "target",
          "rel",
          "controls",
          "style",
          "class",
          "width",
          "height",
        ],
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      }),
    [post.content]
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="text-sm text-gray-400 mb-6">
        {post.authorNickname} · {new Date(post.createdAt).toLocaleString()}
      </div>

      {/* 🔥 본문 + 이미지/동영상이 여기서 한 번만 sanitize */}
      <div
        className="bg-black/20 p-6 rounded-xl mb-6 prose prose-invert max-w-none"
        style={{
          wordBreak: "break-word",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap"
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* 게시글 추천 및 수정 */}
      <div className="flex gap-4 items-center">
        <button
          onClick={onLike}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
            post.isLiked
              ? "border-purple-400 text-purple-400"
              : "border-gray-500 text-gray-300"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          추천 {post.recommendationCount ?? 0}
        </button>

        <button
          onClick={onDislike}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
            post.isDisliked
              ? "border-red-400 text-red-400"
              : "border-gray-500 text-gray-300"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          비추천 {post.dislikeCount ?? 0}
        </button>

        {/* 게시글 수정/삭제 버튼 (본인 게시글일 때만) */}
        {currentUserId &&
          post.authorId &&
          currentUserId === Number(post.authorId) && (
            <>
              <button
                onClick={onEdit}
                className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:text-blue-400 hover:border-blue-400"
              >
                수정
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:text-red-400 hover:border-red-400"
              >
                삭제
              </button>
            </>
          )}
      </div>
    </>
  );
});

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
  const [postFiles, setPostFiles] = useState<FileUploadResponse[]>([]);

  const currentUserId = user?.id ? Number(user.id) : null;

  const requireLogin = useCallback(() => navigate("/login"), [navigate]);

  // 프로필 이미지 URL 해석 함수
  const resolveImage = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `https://res.cloudinary.com/dh9tw89xn/image/upload/${url}`;
  };

  // 뱃지가 이모지인지 확인
  const isEmoji = (v: string) => {
    return /\p{Emoji}/u.test(v);
  };

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

  // 🔥 게시글 추천 (useCallback으로 메모)
  const handleLikePost = useCallback(async () => {
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
  }, [user, requireLogin, postId, post]);

  // 🔥 게시글 비추천 (useCallback으로 메모)
  const handleDislikePost = useCallback(async () => {
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
  }, [user, requireLogin, postId, post]);

  // 게시글 수정 이동도 useCallback으로 메모
  const handleEditPost = useCallback(() => {
    if (!postId) return;
    navigate(`/community/posts/${postId}/edit`);
  }, [navigate, postId]);

  // 게시글 삭제
  const handleDeletePost = useCallback(async () => {
    if (!postId) return;
    if (!window.confirm("게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.")) return;

    try {
      await api.delete(`/community/posts/${postId}`);
      // 삭제 성공 시 커뮤니티 목록으로 이동
      navigate("/community");
    } catch (e: any) {
      console.error("게시글 삭제 실패", e);
      alert(e.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  }, [navigate, postId]);

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

  // 컴포넌트 함수 안에 추가
  const isMyComment = (commentUserId: number) => {
    if (!currentUserId) return false;
    return currentUserId === Number(commentUserId);
  };

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

  // 댓글 수정 시작
  const startEditComment = (comment: Comment) => {
    if (!user) return requireLogin();

    const mine = comment.mine || isMyComment(comment.userId);
    if (!mine) return; // 안전망

    setEditingCommentId(comment.commentId);
    setEditText(comment.content);
  };

  // 댓글 수정 취소
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditText("");
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

        // 파일 목록 조회
        try {
          const filesRes = await api.get(`/community/posts/${postId}/files`);
          setPostFiles(filesRes.data);
        } catch (error) {
          console.error("파일 목록 조회 실패:", error);
        }
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
        {/* 🔥 본문(이미지/동영상 포함) + 추천/비추천은 별도 컴포넌트로 분리 */}
        <PostBody
          post={post}
          currentUserId={currentUserId}
          onLike={handleLikePost}
          onDislike={handleDislikePost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
        />

        {/* (주석 유지) 첨부 파일 섹션
        {postFiles.length > 0 && (...)}
        */}

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
                  <ProfileAvatar
                    avatarUrl={comment.avatarIcon ? resolveImage(comment.avatarIcon) : undefined}
                    frameUrl={comment.profileFrame ? resolveImage(comment.profileFrame) : undefined}
                    size={48}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {comment.nickname}
                      </span>
                      {comment.profileBadge && (
                        isEmoji(comment.profileBadge) ? (
                          <span className="text-lg leading-none">{comment.profileBadge}</span>
                        ) : (
                          <img
                            src={resolveImage(comment.profileBadge)}
                            alt="badge"
                            className="w-5 h-5 object-contain"
                          />
                        )
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>

                    {/* 수정 또는 본문 */}
                    {editingCommentId === comment.commentId ? (
                      <div className="mb-3 space-y-2">
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
                        onClick={() =>
                          handleDislikeComment(comment.commentId)
                        }
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
                            replyTo === comment.commentId
                              ? null
                              : comment.commentId
                          )
                        }
                        className="text-sm text-gray-400 hover:text-purple-400"
                      >
                        답글
                      </button>

                      {(comment.mine || isMyComment(comment.userId)) && (
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
                  </div>
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
                      <Button
                        variant="outline"
                        onClick={() => setReplyTo(null)}
                      >
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
                        <ProfileAvatar
                          avatarUrl={reply.avatarIcon ? resolveImage(reply.avatarIcon) : undefined}
                          frameUrl={reply.profileFrame ? resolveImage(reply.profileFrame) : undefined}
                          size={36}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">
                              {reply.nickname}
                            </span>
                            {reply.profileBadge && (
                              isEmoji(reply.profileBadge) ? (
                                <span className="text-base leading-none">{reply.profileBadge}</span>
                              ) : (
                                <img
                                  src={resolveImage(reply.profileBadge)}
                                  alt="badge"
                                  className="w-4 h-4 object-contain"
                                />
                              )
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
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

                            {(reply.mine || isMyComment(reply.userId)) && (
                              <>
                                <button
                                  onClick={() => startEditComment(reply)}
                                  className="text-xs text-gray-400 hover:text-blue-400"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() =>
                                    deleteComment(reply.commentId)
                                  }
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
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
