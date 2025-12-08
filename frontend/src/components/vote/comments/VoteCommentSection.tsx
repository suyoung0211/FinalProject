// src/components/vote/comments/VoteCommentSection.tsx
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  fetchVoteComments,
  fetchNormalVoteComments,
  addVoteComment,
  reactVoteComment,
  deleteVoteComment,
} from "../../../api/votecommentsApi";
import { VoteCommentItem } from "./VoteCommentItem";
import { VoteCommentInput } from "./VoteCommentInput";
import { useAuth } from "../../../hooks/useAuth";

type TargetType = "VOTE" | "NORMAL";

interface VoteCommentSectionProps {
  targetType: TargetType;
  targetId: number;
}

export function VoteCommentSection({
  targetType,
  targetId,
}: VoteCommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(
    null
  );

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId]);

  async function handleSubmit(content: string, parentId?: number) {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const body: any = {
        content,
      };
      if (targetType === "VOTE") body.voteId = targetId;
      else body.normalVoteId = targetId;
      if (parentId) body.parentId = parentId;

      await addVoteComment(body);
      setReplyTargetId(null);
      await load();
    } catch (e) {
      console.error(e);
      alert("댓글 등록 실패");
    }
  }

  async function handleReact(commentId: number, like: boolean) {
    try {
      await reactVoteComment(commentId, like);
      await load();
    } catch (e) {
      console.error(e);
      alert("반응 실패");
    }
  }

  async function handleDelete(commentId: number) {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      await deleteVoteComment(commentId);
      await load();
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  }

  // 단순 depth 0/1 구조라 가정, 필요하면 더 복잡한 트리 변환 가능
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5" /> 댓글 (
        {comments.length})
      </h3>

      {/* 입력창 (최상단) */}
      <VoteCommentInput
        placeholder="댓글을 입력하세요"
        onSubmit={(content) => handleSubmit(content)}
      />

      {loading && (
        <div className="text-gray-400 text-sm">불러오는 중...</div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-gray-400 text-sm">
          첫 댓글을 남겨보세요!
        </div>
      )}

      {/* 리스트 */}
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
          <div className="text-xs text-gray-300 mb-1">
            대댓글 작성 중...
          </div>
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
