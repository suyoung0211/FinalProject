// src/components/vote/comments/VoteCommentSection.tsx
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  fetchVoteComments,
  addVoteComment,
  reactVoteComment,
  deleteVoteComment,
} from "../../../api/votecommentsApi";

import {
  fetchNormalVoteComments,
  addNormalVoteComment,
  reactNormalVoteComment,
  deleteNormalVoteComment,
} from "../../../api/normalVoteApi";

import { VoteCommentItem } from "./VoteCommentItem";
import { VoteCommentInput } from "./VoteCommentInput";
import { useAuth } from "../../../hooks/useAuth";

type TargetType = "VOTE" | "NORMAL";

interface VoteCommentSectionProps {
  targetType: TargetType; // "VOTE" → AI Vote / "NORMAL" → NormalVote
  targetId: number;
}

export function VoteCommentSection({
  targetType,
  targetId,
}: VoteCommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);

  /* ============================================
   * 댓글 목록 불러오기
   * ============================================ */
  async function load() {
    try {
      setLoading(true);

      let res;
      if (targetType === "VOTE") {
        res = await fetchVoteComments(targetId);
      } else {
        res = await fetchNormalVoteComments(targetId);
      }

      setComments(res.data ?? []);
    } catch (e) {
      console.error("[댓글 불러오기 실패]", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [targetType, targetId]);

  /* ============================================
   * 댓글 작성
   * ============================================ */
  async function handleSubmit(content: string, parentId?: number) {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (targetType === "VOTE") {
        await addVoteComment({
          voteId: targetId,
          content,
          parentId,
        });
      } else {
        await addNormalVoteComment({
          normalVoteId: targetId,
          content,
          parentId,
        });
      }

      setReplyTargetId(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("댓글 등록 실패");
    }
  }

  /* ============================================
   * 좋아요 / 싫어요
   * ============================================ */
  async function handleReact(commentId: number, like: boolean) {
    try {
      if (targetType === "VOTE") {
        await reactVoteComment(commentId, like);
      } else {
        await reactNormalVoteComment(commentId, like);
      }
      await load();
    } catch (e) {
      console.error(e);
      alert("반응 실패");
    }
  }

  /* ============================================
   * 댓글 삭제
   * ============================================ */
  async function handleDelete(commentId: number) {
    if (!window.confirm("댓글을 삭제할까요?")) return;

    try {
      if (targetType === "VOTE") {
        await deleteVoteComment(commentId);
      } else {
        await deleteNormalVoteComment(commentId);
      }
      await load();
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  }

  /* ============================================
   * UI 렌더링
   * ============================================ */
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" /> 댓글 ({comments.length})
      </h3>

      {/* 입력창 */}
      <VoteCommentInput
        placeholder="댓글을 입력하세요"
        onSubmit={(content) => handleSubmit(content)}
      />

      {loading && (
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-gray-400 text-sm">첫 댓글을 남겨보세요!</div>
      )}

      {/* 댓글 리스트 */}
      <div className="space-y-3">
        {comments.map((c: any) => (
          <VoteCommentItem
            key={c.commentId}
            comment={c}
            depth={0}
            onReply={(id) => setReplyTargetId(id)}
            onReact={handleReact}
            onDelete={handleDelete}
            currentUserId={user?.id ?? null}
          />
        ))}
      </div>

      {/* 대댓글 입력 */}
      {replyTargetId && (
        <div className="mt-4 bg-white/5 rounded-xl p-3">
          <div className="text-xs text-gray-300 mb-1">대댓글 작성 중...</div>
          <VoteCommentInput
            autoFocus
            placeholder="대댓글을 입력하세요"
            onSubmit={(content) =>
              handleSubmit(content, replyTargetId ?? undefined)
            }
            onCancel={() => setReplyTargetId(null)}
          />
        </div>
      )}
    </div>
  );
}
