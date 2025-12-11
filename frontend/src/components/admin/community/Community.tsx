// Community.tsx
import { Eye, Trash2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";

// 🔹 게시글 타입
interface CommunityPost {
  postId: number;
  title: string;
  author: string;
  authorNickname: string;
  postType: string;
  recommendationCount: number;
  commentCount: number;
  createdAt: string;
}

// 🔹 댓글 타입
interface CommentItem {
  commentId: number;
  postId: number;
  nickname: string;
  content: string;
  likeCount: number;
  createdAt: string;
}

// 🔹 상태 Badge 표시
function getStatusBadge(status: "ACTIVE" | "HIDDEN") {
  return status === "ACTIVE" ? (
    <span className="text-green-400 font-bold text-sm">공개</span>
  ) : (
    <span className="text-red-400 font-bold text-sm">숨김</span>
  );
}

export function Community() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // 🔥 게시글 목록 조회
  const loadPosts = async () => {
    try {
      const response = await api.get("/community/posts");
      setCommunityPosts(response.data);
    } catch (error) {
      console.error("게시글 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 🔥 댓글 목록 조회
  const loadComments = async () => {
    try {
      const response = await api.get("/community/comments");
      // 대댓글 제외하고 루트 댓글만 표시
      const rootComments = response.data.filter((c: any) => c.parentCommentId === null);
      setComments(rootComments);
    } catch (error) {
      console.error("댓글 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  // 🔥 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.delete(`/community/posts/${postId}`);
      alert("게시글이 삭제되었습니다.");
      loadPosts(); // 목록 새로고침
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error);
      alert(error.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  };

  // 🔥 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.delete(`/community/comments/${commentId}`);
      alert("댓글이 삭제되었습니다.");
      loadComments(); // 목록 새로고침
    } catch (error: any) {
      console.error("댓글 삭제 실패:", error);
      alert(error.response?.data?.message || "댓글 삭제에 실패했습니다.");
    }
  };

  return (
    <div
      className="flex flex-col gap-6"
      style={{ height: "calc(100vh - 64px)" }} // ⭐ 전체 높이 제어
    >
      {/* ⭐ 게시글 관리 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold text-white">게시글 관리</h3>
        </div>

        <div className="overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="p-6 text-center text-gray-400">로딩 중...</div>
          ) : communityPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-400">게시글이 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">제목</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">좋아요</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">댓글</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성일</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {communityPosts.map((post) => (
                  <tr key={post.postId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{post.title || "(제목 없음)"}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">@{post.authorNickname || post.author}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-medium">
                        {post.postType || "일반"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-pink-400 font-bold">{post.recommendationCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-blue-400 font-bold">{post.commentCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/community/posts/${post.postId}`)} // 현재 창으로 변경
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.postId)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ⭐ 댓글 관리 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold text-white">댓글 관리</h3>
        </div>

        <div className="overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="p-6 text-center text-gray-400">로딩 중...</div>
          ) : comments.length === 0 ? (
            <div className="p-6 text-center text-gray-400">댓글이 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">내용</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">게시글 ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">좋아요</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성일</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {comments.map((cmt) => (
                  <tr key={cmt.commentId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white max-w-sm truncate">{cmt.content}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">@{cmt.nickname}</td>
                    <td className="px-6 py-4 text-sm text-blue-300">{cmt.postId}</td>
                    <td className="px-6 py-4 text-sm text-pink-400 font-bold">{cmt.likeCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(cmt.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/community/posts/${cmt.postId}`)} // 현재 창으로 변경
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(cmt.commentId)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
