import { ThumbsUp, ThumbsDown, MessageCircle, Trash2, Edit3 } from "lucide-react";
import { VoteCommentInput } from "./VoteCommentInput";
import { useState } from "react";

interface VoteCommentItemProps {
  comment: any;
  depth: number;
  onReply: (commentId: number) => void;
  onReact: (commentId: number, like: boolean) => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  currentUserId: number | null;
}

export function VoteCommentItem({
  comment,
  depth,
  onReply,
  onReact,
  onDelete,
  onEdit,
  currentUserId,
}: VoteCommentItemProps) {
  const isMine = currentUserId && comment.userId === currentUserId;

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {/* ===== 수정 모드 ===== */}
      {isEditing ? (
        <div style={{ marginLeft: depth * 16 }}>
          <VoteCommentInput
            autoFocus
            placeholder="댓글을 수정하세요"
            onSubmit={(newContent) => {
              onEdit(comment.commentId, newContent);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        /* ===== 일반 댓글 UI ===== */
        <div
          className="bg-white/5 rounded-xl p-3 border border-white/10 mb-2"
          style={{ marginLeft: depth * 16 }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">
                {comment.username ?? "익명"}
              </span>
              <span className="text-xs text-gray-400">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : ""}
              </span>
            </div>

            {isMine && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> 수정
                </button>
                <button
                  onClick={() => onDelete(comment.commentId)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> 삭제
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-200 text-sm mb-2">{comment.content}</p>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <button
              onClick={() => onReact(comment.commentId, true)}
              className="flex items-center gap-1 hover:text-green-400"
            >
              <ThumbsUp className="w-3 h-3" /> {comment.likeCount ?? 0}
            </button>
            <button
              onClick={() => onReact(comment.commentId, false)}
              className="flex items-center gap-1 hover:text-red-400"
            >
              <ThumbsDown className="w-3 h-3" /> {comment.dislikeCount ?? 0}
            </button>

            <button
              onClick={() => onReply(comment.commentId)}
              className="flex items-center gap-1 hover:text-purple-300"
            >
              <MessageCircle className="w-3 h-3" /> 답글
            </button>
          </div>
        </div>
      )}

      {/* 🔥 자식 댓글 재귀 렌더링 */}
      {comment.children?.length > 0 &&
        comment.children.map((child: any) => (
          <VoteCommentItem
            key={child.commentId}
            comment={child}
            depth={depth + 1}
            onReply={onReply}
            onReact={onReact}
            onDelete={onDelete}
            onEdit={onEdit}
            currentUserId={currentUserId}
          />
        ))}
    </div>
  );
}
