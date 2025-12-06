// ======================================================================
// src/components/modal/NewsDetailModal.tsx
// 대댓글 + 좋아요/싫어요 + 정렬/더보기 + 공유 + JWT 인증 통합 최종본
// ======================================================================

import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  ThumbsUp,
  ThumbsDown,
  X,
  User as UserIcon,
} from "lucide-react";

import { useEffect, useState, useMemo } from "react";
import {
  fetchArticleDetail,
  fetchArticleComments,
  postArticleComment,
  reactArticle,
  reactComment,
  updateArticleComment,
  deleteArticleComment,
} from "../../api/articleApi";

import { useArticleModal } from "../../context/ArticleModalContext";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import clsx from "clsx";

// ======================================================================
// JWT 인증 유틸
// ======================================================================
const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() > payload.exp * 1000;
  } catch (e) {
    return true;
  }
};

const requireAuth = () => {
  const token = localStorage.getItem("accessToken");

  if (!token || isTokenExpired(token)) {
    alert("로그인이 필요합니다.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return null;
  }
  return token;
};

// ======================================================================
// 🔥 타입 정의
// ======================================================================

interface RawComment {
  commentId: number;
  parentCommentId: number | null;
  nickname: string;
  avatarIcon?: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  liked: boolean;
  disliked: boolean;
  mine: boolean;
  replies?: RawComment[];
}

interface CommentType {
  commentId: number;
  parentId: number | null;
  nickname: string;
  avatarIcon?: string | null;
  content: string;
  createdAt: string;

  likeCount: number;
  dislikeCount: number;

  liked: boolean;
  disliked: boolean;

  mine: boolean;
  replies: CommentType[];
}

// Raw → 트리 변환
function normalizeComments(raw: RawComment[]): CommentType[] {
  return raw.map((c) => ({
    commentId: c.commentId,
    parentId: c.parentCommentId,
    nickname: c.nickname,
    avatarIcon: c.avatarIcon,
    content: c.content,
    createdAt: c.createdAt,
    likeCount: c.likeCount,
    dislikeCount: c.dislikeCount,
    liked: c.liked,
    disliked: c.disliked,
    mine: c.mine,
    replies: normalizeComments(c.replies ?? []),
  }));
}

// ======================================================================
// 🔥 재귀 댓글 UI
// ======================================================================

interface CommentItemProps {
  comment: CommentType;
  depth: number;

  onReply: (id: number, nickname: string) => void;
  onReact: (id: number, reaction: number) => void;

  onEdit: (comment: CommentType) => void;
  onDelete: (id: number) => void;

  replyTarget: number | null;
  replyText: string;
  setReplyText: (v: string) => void;
  handleReplySubmit: (parentId: number) => void;
}

function CommentItem(props: CommentItemProps) {
  const {
    comment,
    depth,
    onReply,
    onReact,
    onEdit,
    onDelete,
    replyTarget,
    replyText,
    setReplyText,
    handleReplySubmit,
  } = props;

  const indent = depth * 20;

  const dateText =
    comment.createdAt && comment.createdAt.length >= 10
      ? comment.createdAt.slice(0, 10)
      : comment.createdAt;

  return (
    <div className="py-4 border-b border-gray-700" style={{ marginLeft: indent }}>
      {/* 프로필 + 정보 */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {comment.avatarIcon ? (
              <img src={comment.avatarIcon} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-gray-300" />
            )}
          </div>

          <div>
            <div className="text-gray-200 font-semibold text-sm">{comment.nickname}</div>
            <div className="text-xs text-gray-500">{dateText}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <button
            onClick={() => onReply(comment.commentId, comment.nickname)}
            className="hover:text-gray-200"
          >
            답글
          </button>

          {comment.mine && (
            <>
              <button onClick={() => onEdit(comment)} className="hover:text-gray-200">
                수정
              </button>
              <button
                onClick={() => onDelete(comment.commentId)}
                className="hover:text-red-400"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="mt-2 text-gray-200 whitespace-pre-line">{comment.content}</div>

      {/* 좋아요/싫어요 */}
      <div className="flex items-center gap-4 mt-2 text-sm">
        <button
          onClick={() => onReact(comment.commentId, comment.liked ? 0 : 1)}
          className={clsx(
            "flex items-center gap-1",
            comment.liked ? "text-purple-400" : "text-gray-400 hover:text-purple-300"
          )}
        >
          <ThumbsUp className="w-4 h-4" /> {comment.likeCount}
        </button>

        <button
          onClick={() => onReact(comment.commentId, comment.disliked ? 0 : -1)}
          className={clsx(
            "flex items-center gap-1",
            comment.disliked ? "text-red-400" : "text-gray-400 hover:text-red-300"
          )}
        >
          <ThumbsDown className="w-4 h-4" /> {comment.dislikeCount}
        </button>
      </div>

      {/* 대댓글 입력 */}
      {replyTarget === comment.commentId && (
        <div className="ml-5 mt-3">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="bg-gray-800 border-gray-600 text-gray-100"
          />
          <Button className="mt-2 bg-purple-600" onClick={() => handleReplySubmit(comment.commentId)}>
            답글 작성
          </Button>
        </div>
      )}

      {/* 재귀 */}
      {comment.replies.map((child) => (
        <CommentItem
          key={child.commentId}
          comment={child}
          depth={depth + 1}
          onReply={onReply}
          onReact={onReact}
          onEdit={onEdit}
          onDelete={onDelete}
          replyTarget={replyTarget}
          replyText={replyText}
          setReplyText={setReplyText}
          handleReplySubmit={handleReplySubmit}
        />
      ))}
    </div>
  );
}

// ======================================================================
// 🔥 메인 모달
// ======================================================================

export function NewsDetailModal() {
  const { open, articleId, closeModal } = useArticleModal();

  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<CommentType[]>([]);

  const [commentText, setCommentText] = useState("");
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [sortType, setSortType] = useState<"latest" | "popular">("latest");
  const [visibleCount, setVisibleCount] = useState(5);

  // 로딩
  useEffect(() => {
    if (!open || !articleId) return;

    async function load() {
      const detail = await fetchArticleDetail(articleId);
      const rawComments =
        detail.comments ?? (await fetchArticleComments(articleId));

      setArticle(detail);
      setComments(normalizeComments(rawComments));
    }
    load();
  }, [open, articleId]);

  if (!open || !article) return null;

  // ======================================================================
  // 🔥 기사 좋아요/싫어요 (JWT 인증 적용)
  // ======================================================================
  const handleArticleReact = async (reaction: number) => {
    const token = requireAuth();
    if (!token) return;

    try {
      const res = await reactArticle(article.articleId, reaction);

      setArticle((prev: any) => ({
        ...prev,
        likeCount: res.likeCount,
        dislikeCount: res.dislikeCount,
        liked: res.liked,
        disliked: res.disliked,
      }));
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  // ======================================================================
  // 🔥 댓글 좋아요/싫어요 (JWT 인증 적용)
  // ======================================================================
  const updateCommentReaction = (commentId: number, res: any) => {
    const recurse = (list: CommentType[]): CommentType[] =>
      list.map((item) =>
        item.commentId === commentId
          ? { ...item, ...res }
          : { ...item, replies: recurse(item.replies) }
      );

    setComments((prev) => recurse(prev));
  };

  const handleReact = async (commentId: number, reaction: number) => {
  const token = requireAuth();
  if (!token) return;

  try {
    const res = await reactComment(commentId, reaction); // 여기서 res는 res.data임

    updateCommentReaction(commentId, {
      likeCount: res.likeCount,
      dislikeCount: res.dislikeCount,
      liked: res.liked,
      disliked: res.disliked,
    });
  } catch (e) {
    alert("오류가 발생했습니다.");
  }
};

  // ======================================================================
  // 🔥 댓글 작성 & 수정
  // ======================================================================
  const submitComment = async () => {
    const token = requireAuth();
    if (!token) return;

    if (!commentText.trim()) return;

    try {
      if (editingId) {
        await updateArticleComment(editingId, { content: commentText });

        const updated = await fetchArticleComments(articleId!);
        setComments(normalizeComments(updated));

        setEditingId(null);
        setCommentText("");
        return;
      }

      await postArticleComment(articleId!, {
        content: commentText,
        parentCommentId: null,
      });

      const updated = await fetchArticleComments(articleId!);
      setComments(normalizeComments(updated));
      setCommentText("");
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  // ======================================================================
  // 🔥 대댓글 작성
  // ======================================================================
  const handleReplySubmit = async (parentId: number) => {
    const token = requireAuth();
    if (!token) return;

    if (!replyText.trim()) return;

    try {
      await postArticleComment(articleId!, {
        content: replyText,
        parentCommentId: parentId,
      });

      const updated = await fetchArticleComments(articleId!);
      setComments(normalizeComments(updated));

      setReplyText("");
      setReplyTarget(null);
    } catch (e) {
      alert("오류가 발생했습니다.");
    }
  };

  // ======================================================================
  // 🔥 댓글 삭제
  // ======================================================================
  const handleDelete = async (id: number) => {
    const token = requireAuth();
    if (!token) return;

    if (!window.confirm("삭제하시겠습니까?")) return;

    try {
      await deleteArticleComment(id);

      const updated = await fetchArticleComments(articleId!);
      setComments(normalizeComments(updated));
    } catch (e) {
      alert("삭제 중 오류 발생");
    }
  };

  // ======================================================================
  // 🔥 공유
  // ======================================================================
  const copyAppUrl = async () => {
    const modalUrl = `${window.location.origin}/?articleId=${article.articleId}`;
    await navigator.clipboard.writeText(modalUrl);
    alert("모달 링크 복사 완료!");
  };

  const copyNewsUrl = async () => {
    await navigator.clipboard.writeText(article.link);
    alert("뉴스 원본 링크가 복사되었습니다!");
  };

  // ======================================================================
  // 🔥 정렬 + 더보기
  // ======================================================================
  const sorted = useMemo(() => {
    const arr = [...comments];

    if (sortType === "latest") {
      return arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return arr.sort((a, b) => b.likeCount - a.likeCount);
  }, [comments, sortType]);

  const visibleComments = sorted.slice(0, visibleCount);

  const publishedDate =
    article.publishedAt && article.publishedAt.length >= 10
      ? article.publishedAt.slice(0, 10)
      : article.publishedAt;

  // ======================================================================
  // 🔥 렌더링
  // ======================================================================

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur flex justify-center items-start overflow-y-auto py-10">
      <div className="w-[900px] bg-[#1a1a1a] rounded-2xl shadow-xl text-white overflow-hidden">
        {/* HEADER */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <ArrowLeft className="cursor-pointer" onClick={closeModal} />
          <h2 className="font-semibold line-clamp-1">{article.title}</h2>
          <X className="cursor-pointer" onClick={closeModal} />
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>

          <a href={article.link} target="_blank" rel="noreferrer" className="text-blue-400 underline text-lg">
            🔗 원본 기사 보기
          </a>

          <p className="text-gray-400 text-sm mt-1 mb-4">
            👉 이미지를 클릭하면 원본 뉴스 페이지로 이동합니다.
          </p>

          {/* 썸네일 */}
          {article.thumbnailUrl && (
            <img
              src={article.thumbnailUrl}
              className="w-full mb-5 rounded-xl cursor-pointer hover:opacity-90"
              onClick={() => window.open(article.link, "_blank")}
            />
          )}

          {/* 메타 정보 */}
          <div className="flex gap-3 text-gray-400 mb-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {publishedDate}
            </span>
            •
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.viewCount}
            </span>
            • {article.publisher}
          </div>

          {/* 좋아요 / 싫어요 / 공유 */}
          <div className="flex items-center gap-3 mb-6">
            {/* 좋아요 */}
            <button
              onClick={() => handleArticleReact(article.liked ? 0 : 1)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border",
                article.liked
                  ? "bg-purple-600 border-purple-600"
                  : "border-gray-600 hover:bg-gray-800"
              )}
            >
              <ThumbsUp className="w-4 h-4" /> {article.likeCount}
            </button>

            {/* 싫어요 */}
            <button
              onClick={() => handleArticleReact(article.disliked ? 0 : -1)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border",
                article.disliked
                  ? "bg-red-600 border-red-600"
                  : "border-gray-600 hover:bg-gray-800"
              )}
            >
              <ThumbsDown className="w-4 h-4" /> {article.dislikeCount}
            </button>

            {/* 공유 */}
            <button
              onClick={copyAppUrl}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-800"
            >
              <Share2 className="w-4 h-4" /> 공유
            </button>

            {/* 뉴스 공유 */}
            <button
              onClick={copyNewsUrl}
              className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-800"
            >
              <Share2 className="w-4 h-4" /> 뉴스 공유
            </button>
             {/* 🔥 투표하러가기 버튼 (ONGOING일 때만) */}
{article.connectedVoteId && article.connectedVoteStatus === "ONGOING" && (
  <button
    onClick={() => window.open(`/vote/${article.connectedVoteId}`, "_blank")}
    className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-300 rounded-full hover:bg-green-900/40 transition"
  >
    🟢 투표하러 가기
  </button>
)}
          </div>

          {/* 댓글 작성/수정 입력 */}
          <div className="p-4 bg-[#222] rounded-xl mb-6 border border-gray-700">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={editingId ? "수정할 내용을 입력하세요..." : "댓글을 입력하세요..."}
              className="bg-[#333] border-gray-600 text-white"
            />

            <div className="flex gap-3 mt-3">
              <Button className="bg-purple-600" onClick={submitComment}>
                {editingId ? "수정 완료" : "댓글 작성"}
              </Button>

              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setCommentText("");
                  }}
                >
                  취소
                </Button>
              )}
            </div>
          </div>

          {/* 정렬 */}
          <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
            <span>댓글 {comments.length}개</span>

            <div className="flex gap-2">
              <button
                onClick={() => setSortType("latest")}
                className={clsx(
                  "px-2 py-1 rounded-full border text-xs",
                  sortType === "latest"
                    ? "bg-purple-600 border-purple-600"
                    : "border-gray-600"
                )}
              >
                최신순
              </button>

              <button
                onClick={() => setSortType("popular")}
                className={clsx(
                  "px-2 py-1 rounded-full border text-xs",
                  sortType === "popular"
                    ? "bg-purple-600 border-purple-600"
                    : "border-gray-600"
                )}
              >
                인기순
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          <div>
            {visibleComments.map((c) => (
              <CommentItem
                key={c.commentId}
                comment={c}
                depth={0}
                onReply={(id, nickname) => {
                  setReplyTarget(id);
                  setReplyText(`@${nickname} `);
                }}
                onReact={handleReact}
                onEdit={(comment) => {
                  setEditingId(comment.commentId);
                  setCommentText(comment.content);
                }}
                onDelete={handleDelete}
                replyTarget={replyTarget}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
              />
            ))}
          </div>

          {/* 더보기 */}
          {visibleCount < comments.length && (
            <div className="text-center mt-4">
              <button
                className="text-purple-300"
                onClick={() => setVisibleCount((v) => v + 10)}
              >
                더보기 ↓
              </button>
            </div>
          )}

          {/* 접기 */}
          {visibleCount > 5 && (
            <div className="text-center mt-2">
              <button
                className="text-gray-400"
                onClick={() => setVisibleCount(5)}
              >
                접기 ↑
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
