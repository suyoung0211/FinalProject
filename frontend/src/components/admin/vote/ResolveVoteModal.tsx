import { Button } from "../../ui/button";
import { useState } from "react";

export function ResolveVoteModal({ vote, onClose, onSubmit }: any) {
  const [selectedChoices, setSelectedChoices] = useState<Record<number, number>>(
    {}
  );

  if (!vote) return null;

  const options = vote.options ?? [];

  const unselectedOptions = options.filter(
    (opt: any) => !selectedChoices[opt.optionId ?? opt.id]
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-[420px] space-y-4">

        <h2 className="text-white font-bold text-lg">
          정답 선택 — {vote.title}
        </h2>

        <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
          {options.map((opt: any) => {
            const optionId = opt.optionId ?? opt.id;
            const notSelected = !selectedChoices[optionId];

            return (
              <div
                key={optionId}
                className={`pb-2 border-b ${
                  notSelected
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10"
                }`}
              >
                <p className="text-sm mb-2 flex items-center gap-2">
                  <span className="text-gray-300">
                    {opt.optionTitle ?? opt.title}
                  </span>
                  {notSelected && (
                    <span className="text-xs text-red-400">
                      (정답 선택 필요)
                    </span>
                  )}
                </p>

                {opt.choices.map((c: any) => (
                  <label
                    key={c.choiceId ?? c.id}
                    className="flex gap-2 items-center text-white text-sm mb-1"
                  >
                    <input
                      type="radio"
                      name={`option-${optionId}`}
                      checked={selectedChoices[optionId] === (c.choiceId ?? c.id)}
                      onChange={() =>
                        setSelectedChoices((prev) => ({
                          ...prev,
                          [optionId]: c.choiceId ?? c.id,
                        }))
                      }
                    />
                    {c.text ?? c.choiceText}
                  </label>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gray-600/30"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-purple-600"
            onClick={() => {
              if (unselectedOptions.length > 0) {
                alert("모든 옵션에 대해 정답을 선택해주세요.");
                return;
              }
              onSubmit(selectedChoices);
            }}
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
