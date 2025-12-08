// src/components/vote/comments/VoteCommentItem.tsx
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2 } from "lucide-react";

interface VoteCommentItemProps {
  comment: any;
  depth: number;
  onReply: (commentId: number) => void;
  onReact: (commentId: number, like: boolean) => void;
  onDelete: (commentId: number) => void;
  currentUserId: number | null;
}

export function VoteCommentItem({
  comment,
  depth,
  onReply,
  onReact,
  onDelete,
  currentUserId,
}: VoteCommentItemProps) {
  const isMine = currentUserId && comment.userId === currentUserId;

  return (
    <div
      className="bg-white/5 rounded-xl p-3 border border-white/10"
      style={{ marginLeft: depth * 16 }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">
            {comment.nickname ?? "익명"}
          </span>
          <span className="text-xs text-gray-400">
            {comment.createdAt
              ? new Date(comment.createdAt).toLocaleString()
              : ""}
          </span>
        </div>

        {isMine && (
          <button
            onClick={() => onDelete(comment.commentId)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> 삭제
          </button>
        )}
      </div>

      <p className="text-gray-200 text-sm mb-2">{comment.content}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <button
          onClick={() => onReact(comment.commentId, true)}
          className="flex items-center gap-1 hover:text-green-400"
        >
          <ThumbsUp className="w-3 h-3" />{" "}
          {comment.likeCount ?? 0}
        </button>
        <button
          onClick={() => onReact(comment.commentId, false)}
          className="flex items-center gap-1 hover:text-red-400"
        >
          <ThumbsDown className="w-3 h-3" />{" "}
          {comment.dislikeCount ?? 0}
        </button>
        <button
          onClick={() => onReply(comment.commentId)}
          className="flex items-center gap-1 hover:text-purple-300"
        >
          <MessageCircle className="w-3 h-3" /> 답글
        </button>
      </div>
    </div>
  );
}
