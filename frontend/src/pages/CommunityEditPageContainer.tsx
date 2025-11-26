// src/pages/CommunityEditPageContainer.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { CommunityWritePage } from "../components/CommunityWritePage";

interface ApiPost {
  postId: number;
  title: string;
  content: string;
  postType: string;      // '일반' | '이슈추천' | '포인트자랑'
  authorId: number;
  authorNickname: string;
  createdAt: string;
  recommendationCount?: number;
  commentCount?: number;
  authorLevel?: number;
  // tags를 나중에 백엔드에서 내려주면 여기에 추가
  tags?: string[];
}

export function CommunityEditPageContainer() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<ApiPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await api.get<ApiPost>(`/community/posts/${postId}`);
      setPost(res.data);
    };
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (!post) return <div className="text-white p-4">로딩중…</div>;

  return (
    <CommunityWritePage
      mode="edit"
      initialPost={{
        postId: post.postId,
        title: post.title,
        content: post.content,
        postType: post.postType,
        tags: post.tags ?? [],
      }}
      onBack={() => navigate(-1)}
      onSubmit={() => navigate("/community")}
    />
  );
}
