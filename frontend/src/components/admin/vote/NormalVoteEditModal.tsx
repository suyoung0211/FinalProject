import { Button } from "../../ui/button";
import { useState } from "react";

export interface NormalVoteEditModalProps {
  vote: {
    id: number;
    title: string;
    description?: string;
  };
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
}

export function NormalVoteEditModal({
  vote,
  onClose,
  onSubmit,
}: NormalVoteEditModalProps) {
  const [title, setTitle] = useState<string>(vote.title);
  const [description, setDescription] = useState<string>(vote.description ?? "");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[500px] shadow-xl">

        <h2 className="text-white text-lg font-bold mb-4">일반투표 수정</h2>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">제목</label>
          <input
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2 mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-300 text-sm">설명</label>
          <textarea
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2 mt-1"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            className="bg-gray-600/30 text-white flex-1"
          >
            취소
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            onClick={() => onSubmit({ title, description })}
          >
            저장
          </Button>
        </div>

      </div>
    </div>
  );
}
