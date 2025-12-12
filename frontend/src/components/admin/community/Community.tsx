import { Eye, Trash2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCommunityPosts,
  getCommunityComments,
  deleteCommunityPost,
  deleteCommunityComment,
} from "../../../api/adminAPI";
import { CommunityPostModal } from "./CommunityPostModal";

// 🔹 게시글 타입
interface CommunityPost {
  postId: number;
  authorNickname: string;
  commentCount: number;
  content: string;
  createdAt: string;
  updateAt: string;
  title: string;
  postType: string;
  viewCount: number;
  recommendationCount: number;
  dislikes: number;
}

// 🔹 댓글 타입
interface CommentItem {
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
}

export function Community() {
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // 🔹 게시글 조회
  const loadPosts = async () => {
    try {
      const response = await getCommunityPosts();
      console.log(response.data)
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

  // 🔹 댓글 조회
  const loadComments = async () => {
    try {
      const response = await getCommunityComments();
      const rootComments = response.data.filter((c: any) => c.parentCommentId === null);
      console.log(rootComments)
      setComments(rootComments);
    } catch (error) {
      console.error("댓글 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  // 🔹 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await deleteCommunityPost(postId);
      alert("게시글이 삭제되었습니다.");
      loadPosts();
      loadComments();
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error);
      alert(error.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  };

  // 🔹 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteCommunityComment(commentId);
      alert("댓글이 삭제되었습니다.");
      loadPosts();
      loadComments();
    } catch (error: any) {
      console.error("댓글 삭제 실패:", error);
      alert(error.response?.data?.message || "댓글 삭제에 실패했습니다.");
    }
  };

  // 🔹 모달 열기
  const openPostModal = (postId: number) => {
    setSelectedPostId(postId);
    setModalOpen(true);
  };

  // 🔹 모달 닫기
  const closeModal = () => {
    setModalOpen(false);
    setSelectedPostId(null);
    // 모달 닫을 때 게시글과 댓글 최신화
    loadPosts();
    loadComments();
  };

  return (
    <div className="flex flex-col gap-6" style={{ height: "calc(100vh - 64px)" }}>
      {/* 게시글 관리 */}
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
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">번호</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">제목</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">카테고리</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">추천</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">비추천</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">댓글</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">조회수</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">작성일</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">수정일</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {communityPosts.map((post) => (
                  <tr
                    key={post.postId}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    // 관리 버튼 영역 클릭은 무시
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest(".post-actions")) return;
                      openPostModal(post.postId);
                    }}
                  >
                    <td className="px-6 py-4 text-center text-sm text-white">{post.postId}</td>
                    <td className="px-6 py-4 text-center text-sm text-white">{post.title || "(제목 없음)"}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-300">{post.authorNickname}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-medium">
                        {post.postType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-pink-400 font-bold">{post.recommendationCount || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-blue-400 font-bold">{post.dislikes || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-300">{post.commentCount || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-300">{post.viewCount || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">{post.createdAt.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">{post.updateAt ? post.updateAt.slice(0, 16).replace("T", " ") : "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center post-actions">
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

      {/* 댓글 관리 */}
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
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">게시글 번호</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">내용</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">추천</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">비추천</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">작성일</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">수정일</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comments.map((cmt) => (
                  <tr 
                    key={cmt.commentId} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    // 관리 버튼이 아닌 영역 클릭 시 모달 열기
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      // 관리 버튼 영역 클릭이면 무시
                      if (target.closest(".comment-actions")) return;
                      openPostModal(cmt.postId);
                    }}
                  >
                    <td className="px-6 py-4 text-center text-sm text-blue-300">{cmt.postId}</td>
                    <td className="px-6 py-4 text-center text-sm text-white max-w-sm truncate">{cmt.content}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-300">{cmt.nickname}</td>
                    <td className="px-6 py-4 text-center text-sm text-pink-400 font-bold">{cmt.likeCount || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-blue-400 font-bold">{cmt.dislikeCount || 0}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">{cmt.createdAt.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">{cmt.updatedAt ? cmt.updatedAt.slice(0, 16).replace("T", " ") : "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center comment-actions">
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

      {/* 🔹 모달 */}
      {modalOpen && selectedPostId && (
        <CommunityPostModal postId={selectedPostId} onClose={closeModal} />
      )}
    </div>
  );
}
