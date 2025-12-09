// src/components/voteDetail/VoteModal.tsx
import { Button } from "../../components/ui/button";

export function VoteModal({
  choiceId,
  amount,
  odds,
  percent,
  onClose,
  onConfirm,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-white text-2xl font-bold mb-6">투표 확인</h2>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="text-gray-400 text-sm">배팅 포인트</div>
          <div className="text-white text-3xl font-bold">{amount}pt</div>

          <div className="mt-4 flex justify-between text-gray-400">
            <span>현재 확률</span>
            <span className="text-white">{percent}%</span>
          </div>

          <div className="mt-2 flex justify-between text-gray-400">
            <span>현재 배당률</span>
            <span className="text-green-300 font-semibold">
              x{odds?.toFixed(2) ?? "1.00"}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>

          {/* 🔥 핵심: mode 버리고 choiceId 를 직접 넘김 */}
          <Button
            className="flex-1 bg-purple-600 text-white"
            onClick={() => onConfirm(choiceId)}
          >
            투표 확정
          </Button>
        </div>
      </div>
    </div>
  );
}
