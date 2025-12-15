import { Button } from "../../ui/button";
import { useState } from "react";

interface ResolveVoteModalProps {
  vote: any;
  onClose: () => void;
  onSubmit: (choiceId: number) => void;
}

export function ResolveVoteModal({
  vote,
  onClose,
  onSubmit,
}: ResolveVoteModalProps) {
  const [choiceId, setChoiceId] = useState<number | null>(null);

  // 🔥 vote가 없을 때 방어 처리
  if (!vote) {
    return null;
  }

  const title = vote?.title ?? "제목 없음";

  // 🔥 옵션/선택지 안전 처리 (형식 통일)
  const options = Array.isArray(vote.options)
    ? vote.options.map((opt: any) => ({
        optionId: opt.optionId ?? opt.id,
        optionTitle: opt.optionTitle ?? opt.title ?? "옵션",
        choices: Array.isArray(opt.choices)
          ? opt.choices.map((c: any) => ({
              choiceId: c.choiceId ?? c.id,
              text: c.choiceText ?? c.text ?? "선택지",
            }))
          : [],
      }))
    : [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[400px] shadow-xl space-y-4">

        {/* 타이틀 */}
        <h2 className="text-white text-lg font-bold mb-4">
          정답 선택 — "{title}"
        </h2>

        {/* 선택지 리스트 */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">

          {options.map((opt: any) => (
            <div key={opt.optionId} className="pb-2 border-b border-white/10">
              <p className="text-sm text-gray-300 mb-2">{opt.optionTitle}</p>

              {opt.choices.map((c: any) => (
                <label
                  key={c.choiceId}
                  className="flex items-center gap-3 text-white mb-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="choice"
                    value={c.choiceId}
                    checked={choiceId === c.choiceId}
                    onChange={() => setChoiceId(c.choiceId)}
                  />
                  <span>{c.text}</span>
                </label>
              ))}
            </div>
          ))}

          {options.length === 0 && (
            <p className="text-gray-400 text-sm text-center">
              선택지가 없습니다.
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1 bg-gray-600/30 hover:bg-gray-600/50"
            onClick={onClose}
          >
            취소
          </Button>

          <Button
            disabled={!choiceId}
            className={`flex-1 ${
              choiceId
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-purple-600/40 cursor-not-allowed"
            }`}
            onClick={() => choiceId && onSubmit(choiceId)}
          >
            저장
          </Button>
        </div>

      </div>
    </div>
  );
}
