// src/components/vote/comments/VoteCommentInput.tsx
import { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "../../ui/button";

interface VoteCommentInputProps {
  placeholder?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function VoteCommentInput({
  placeholder,
  onSubmit,
  onCancel,
  autoFocus,
}: VoteCommentInputProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (autoFocus) {
      // eslint-disable-next-line no-undef
      const el = document.getElementById("vote-comment-input");
      el?.focus();
    }
  }, [autoFocus]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-2">
      <textarea
        id="vote-comment-input"
        className="w-full bg-transparent outline-none text-sm text-white resize-none"
        placeholder={placeholder ?? "댓글을 입력하세요"}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            취소
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          className="bg-purple-600 text-white text-xs"
        >
          등록
        </Button>
      </div>
    </div>
  );
}
