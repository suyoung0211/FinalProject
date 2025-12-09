// Community.tsx
import { Eye, Trash2, MessageSquare } from "lucide-react";
import { useState } from "react";

// 🔹 게시글 타입
interface CommunityPost {
  id: number;
  title: string;
  author: string;
  category: string;
  likes: number;
  comments: number;
  status: "ACTIVE" | "HIDDEN";
}

// 🔹 댓글 타입
interface CommentItem {
  id: number;
  postId: number;
  user: string;
  content: string;
  likes: number;
  status: "ACTIVE" | "HIDDEN";
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
  // 🔹 목킹 데이터
  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      title: "이번 주 영화 추천",
      author: "홍길동",
      category: "영화",
      likes: 15,
      comments: 5,
      status: "ACTIVE",
    },
    {
      id: 2,
      title: "AI 뉴스 제목 개선",
      author: "김철수",
      category: "IT",
      likes: 8,
      comments: 3,
      status: "HIDDEN",
    },
  ]);

  const [comments] = useState<CommentItem[]>([
    {
      id: 101,
      postId: 1,
      user: "사용자1",
      content: "정말 재미있어요!",
      likes: 3,
      status: "ACTIVE",
    },
    {
      id: 102,
      postId: 1,
      user: "사용자2",
      content: "저도 추천합니다",
      likes: 1,
      status: "HIDDEN",
    },
    {
      id: 103,
      postId: 2,
      user: "사용자3",
      content: "좋은 아이디어네요",
      likes: 2,
      status: "ACTIVE",
    },
  ]);

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
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">제목</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">좋아요</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">댓글</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {communityPosts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{post.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">@{post.author}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-medium">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-pink-400 font-bold">{post.likes}</td>
                  <td className="px-6 py-4 text-sm text-blue-400 font-bold">{post.comments}</td>
                  <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ⭐ 댓글 관리 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col flex-1">
        <div className="p-6 border-b border-white/10">
          <h3 className="font-bold text-white">댓글 관리</h3>
        </div>

        <div className="overflow-y-auto scrollbar-hide">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">내용</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">작성자</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">게시글 ID</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">좋아요</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {comments.map((cmt) => (
                <tr key={cmt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-white max-w-sm truncate">{cmt.content}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">@{cmt.user}</td>
                  <td className="px-6 py-4 text-sm text-blue-300">{cmt.postId}</td>
                  <td className="px-6 py-4 text-sm text-pink-400 font-bold">{cmt.likes}</td>
                  <td className="px-6 py-4">{getStatusBadge(cmt.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
