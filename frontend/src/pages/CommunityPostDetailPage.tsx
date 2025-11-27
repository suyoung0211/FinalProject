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
  commentCount?: number;
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // ⭐ baseURL이 /api 이므로 여기에는 /community/... 만 적기
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

