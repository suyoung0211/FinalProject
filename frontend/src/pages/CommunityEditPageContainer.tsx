import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommunityWritePage } from "./CommunityWritePage";
import { useAuth } from "../hooks/useAuth";
import api from "../api/api";

export function CommunityEditPageContainer() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialPost, setInitialPost] = useState<{
    postId: number;
    title: string;
    content: string;
    postType: string;
    tags: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError("게시글 ID가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/community/posts/${postId}`);
        const post = res.data;

        // 작성자 확인
        if (user?.id && post.authorId && Number(user.id) !== Number(post.authorId)) {
          setError("수정 권한이 없습니다.");
          setLoading(false);
          return;
        }

        setInitialPost({
          postId: post.postId,
          title: post.title,
          content: post.content,
          postType: post.postType || "일반",
          tags: [], // 백엔드에 태그 필드가 없으면 빈 배열
        });
      } catch (e: any) {
        console.error("게시글 조회 실패", e);
        if (e.response?.status === 404) {
          setError("게시글을 찾을 수 없습니다.");
        } else if (e.response?.status === 403) {
          setError("수정 권한이 없습니다.");
        } else {
          setError("게시글을 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user]);

  if (loading) {
    return (
      <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error || !initialPost) {
    return (
      <div className="min-h-screen text-white p-8 bg-gradient-to-b from-slate-900 to-purple-900">
        <button
          onClick={() => navigate("/community")}
          className="mb-4 text-purple-300 hover:text-purple-200"
        >
          ← 목록으로
        </button>
        <div className="text-red-400">{error || "게시글을 불러올 수 없습니다."}</div>
      </div>
    );
  }

  return (
    <CommunityWritePage
      mode="edit"
      initialPost={initialPost}
      onBack={() => navigate(`/community/posts/${postId}`)}
      onSubmit={() => navigate(`/community/posts/${postId}`)}
    />
  );
}


