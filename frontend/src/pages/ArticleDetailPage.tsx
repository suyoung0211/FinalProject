import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  fetchArticleDetail,
  fetchArticleComments,
  postArticleComment,
  toggleArticleLike,
  toggleArticleDislike,
  toggleArticleBookmark,
  increaseArticleView,
  fetchRelatedArticles
} from "../api/articleApi";

import {
  ArrowLeft,
  Clock,
  Eye,
  ThumbsUp,
  Bookmark,
  Share2
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

// =========================
//        타입 정의
// =========================
interface ArticleDetail {
  id: number;
  title: string;
  summary: string;
  content: string;
  categories: string[];
  imageUrl?: string;
  views: number;
  likes: number;
  dislikes: number;
  timeAgo: string;

  isLiked: boolean;
  isDisliked: boolean;
  isBookmarked: boolean;
}

interface Comment {
  commentId: number;
  authorName: string;
  content: string;
  timeAgo: string;
}

interface RelatedNews {
  id: number;
  title: string;
  timeAgo: string;
}


// =================================================
//                 페이지 컴포넌트
// =================================================
export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<RelatedNews[]>([]);
  const [commentText, setCommentText] = useState("");

  // =============================================
  //           데이터 로딩 (최적화 버전)
  // =============================================
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [detail, commentList, relatedNews] = await Promise.all([
          fetchArticleDetail(id),
          fetchArticleComments(id),
          fetchRelatedArticles(id),
        ]);

        setArticle(detail);
        setComments(commentList);
        setRelated(relatedNews);

        increaseArticleView(id);
      } catch (err) {
        console.error("기사 상세 로딩 실패:", err);
      }
    })();

  }, [id]);


  // =============================================
  //              좋아요 & 싫어요
  // =============================================
  const handleLike = async () => {
    if (!id || !article) return;

    try {
      const res = await toggleArticleLike(id);

      setArticle(prev =>
        prev
          ? {
              ...prev,
              isLiked: res.liked,
              isDisliked: res.liked ? false : prev.isDisliked,
              likes: res.liked ? prev.likes + 1 : prev.likes,
              dislikes: res.liked && prev.isDisliked ? prev.dislikes - 1 : prev.dislikes
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDislike = async () => {
    if (!id || !article) return;

    try {
      const res = await toggleArticleDislike(id);

      setArticle(prev =>
        prev
          ? {
              ...prev,
              isDisliked: res.disliked,
              isLiked: res.disliked ? false : prev.isLiked,
              dislikes: res.disliked ? prev.dislikes + 1 : prev.dislikes,
              likes: res.disliked && prev.isLiked ? prev.likes - 1 : prev.likes
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =============================================
  //                북마크
  // =============================================
  const handleBookmark = async () => {
    if (!id || !article) return;

    try {
      const res = await toggleArticleBookmark(id);

      setArticle(prev =>
        prev ? { ...prev, isBookmarked: res.bookmarked } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  // =============================================
  //                댓글 작성
  // =============================================
  const handleCommentSubmit = async () => {
    if (!id) return;
    if (!commentText.trim()) return;

    try {
      const newComment = await postArticleComment(id, {
        content: commentText,
      });

      setComments(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    }
  };

  if (!article) {
    return <div className="mt-32 text-center text-white">Loading...</div>;
  }

  // ======================================================
  //                       화면 렌더
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* 뒤로가기 */}
      <div className="container mx-auto px-4 pt-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          뒤로가기
        </button>

        {/* ============================ 기사 본문 ============================ */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          {/* 이미지 */}
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full rounded-xl mb-6"
            />
          )}

          {/* 카테고리 */}
          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
            {article.categories?.[0]}
          </span>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-3">
            <Clock className="w-4 h-4" />
            {article.timeAgo}
            <span>•</span>
            <Eye className="w-4 h-4" />
            {article.views?.toLocaleString()}
          </div>

          {/* 제목 */}
          <h1 className="text-white text-3xl font-bold mt-4 mb-6">{article.title}</h1>

          {/* 요약 */}
          <p className="text-gray-300 bg-white/5 p-4 rounded-lg mb-6">
            {article.summary}
          </p>

          {/* 본문 */}
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {article.content}
          </div>

          {/* 좋아요 / 싫어요 / 저장 / 공유 */}
          <div className="flex gap-4 mt-8">
            
            {/* 좋아요 */}
            <Button
              onClick={handleLike}
              variant={article.isLiked ? "default" : "outline"}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              좋아요 {article.isLiked ? article.likes : article.likes}
            </Button>

            {/* 싫어요 */}
            <Button
              onClick={handleDislike}
              variant={article.isDisliked ? "default" : "outline"}
              className={article.isDisliked ? "bg-red-600/50 border-red-500/50" : ""}
            >
              👎 싫어요 {article.isDisliked ? article.dislikes : article.dislikes}
            </Button>

            {/* 저장 */}
            <Button
              onClick={handleBookmark}
              variant="outline"
              className={article.isBookmarked ? "text-yellow-400 border-yellow-500/50" : ""}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {article.isBookmarked ? "저장됨" : "저장"}
            </Button>

            {/* 공유 */}
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
          </div>
        </div>

        {/* ============================ 댓글 ============================ */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl mt-8">
          <h2 className="text-white text-xl font-bold mb-6">댓글 {comments.length}</h2>

          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글 입력..."
            className="bg-white/5 text-white border-white/10 mb-4"
          />

          <Button onClick={handleCommentSubmit}>댓글 작성</Button>

          <div className="mt-8 space-y-6">
            {comments.map((c) => (
              <div key={c.commentId} className="border-b border-white/10 pb-4">
                <div className="text-white font-medium">{c.authorName}</div>
                <div className="text-gray-400 text-sm">{c.timeAgo}</div>
                <p className="text-gray-300 mt-2">{c.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================ 관련 뉴스 ============================ */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mt-8">
          <h3 className="text-white font-bold mb-4">관련 뉴스</h3>

          <div className="space-y-3">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/article/${r.id}`)}
                className="block w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <div className="text-white font-medium">{r.title}</div>
                <div className="text-gray-400 text-sm">{r.timeAgo}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}