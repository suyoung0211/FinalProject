import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";

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
  commentCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 추천 처리 함수
  const handleLikePost = async () => {
    if (!user) return alert("로그인이 필요합니다.");

    try {
      await api.post(`/community/posts/${postId}/like`);

      if (!post) return;

      const newLike = post.isLiked ? (post.recommendationCount || 1) - 1 : (post.recommendationCount || 0) + 1;
      const newDislike = post.isLiked
        ? post.dislikeCount
        : post.isDisliked
        ? (post.dislikeCount || 1) - 1
        : post.dislikeCount;

      setPost({
        ...post,
        recommendationCount: newLike,
        dislikeCount: newDislike,
        isLiked: !post.isLiked,
        isDisliked: false,
      });
    } catch (e) {
      console.error("게시글 추천 실패", e);
      alert("추천 실패");
    }
  };

  // 🔥 비추천 처리 함수
  const handleDislikePost = async () => {
    if (!user) return alert("로그인이 필요합니다.");

    try {
      await api.post(`/community/posts/${postId}/dislike`);

      if (!post) return;

      const newDislike = post.isDisliked ? (post.dislikeCount || 1) - 1 : (post.dislikeCount || 0) + 1;
      const newLike = post.isDisliked
        ? post.recommendationCount
        : post.isLiked
        ? (post.recommendationCount || 1) - 1
        : post.recommendationCount;

      setPost({
        ...post,
        dislikeCount: newDislike,
        recommendationCount: newLike,
        isDisliked: !post.isDisliked,
        isLiked: false,
      });
    } catch (e) {
      console.error("게시글 비추천 실패", e);
      alert("비추천 실패");
    }
  };

  // 🔥 게시글 가져오기
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/community/posts/${postId}`);
        setPost(res.data);
      } catch (e) {
        console.error("게시글 조회 실패", e);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // 🔥 로딩
  if (loading) {
    return (
      <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  // 🔥 에러
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
  const authorName = post.authorNickname || post.author || '알 수 없음';

  return (
    <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900">
      <button
        onClick={() => navigate("/community")}
        className="text-purple-300 hover:text-purple-200 mb-6"
      >
        ← 목록으로
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="text-sm text-gray-400 flex gap-2 items-center mb-6">
          <span>{authorName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>

          <span>· 추천 {post.recommendationCount ?? 0}</span>
          <span>· 비추천 {post.dislikeCount ?? 0}</span>
          <span>· 댓글 {post.commentCount ?? 0}</span>
        </div>

        <div className="whitespace-pre-wrap leading-relaxed bg-black/20 rounded-xl p-6 mb-6">
          {post.content}
        </div>

        {/* 🔥 추천 / 비추천 버튼 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleLikePost}
            className={`px-4 py-2 rounded-lg border ${
              post.isLiked ? "bg-purple-600 border-purple-400" : "border-gray-500"
            }`}
          >
            👍 추천 {post.recommendationCount}
          </button>

          <button
            onClick={handleDislikePost}
            className={`px-4 py-2 rounded-lg border ${
              post.isDisliked ? "bg-red-600 border-red-400" : "border-gray-500"
            }`}
          >
            👎 비추천 {post.dislikeCount}
          </button>
        </div>

        {/* 글 작성자만 보이는 버튼 */}
        {isMyPost && (
          <div className="flex gap-3">
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
      </div>
    </div>
  );
}
