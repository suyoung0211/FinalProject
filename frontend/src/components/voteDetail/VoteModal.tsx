import { Button } from "../../components/ui/button";

export function VoteModal({
  choiceId,
  amount,
  currentOdds,
  expectedOdds,
  expectedReward,
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

          {/* 현재 배당률 */}
<div className="mt-2 flex justify-between text-gray-400">
  <span>현재 배당률</span>
  <span className="text-green-300 font-semibold">
    x{currentOdds?.toFixed(2)}
  </span>
</div>

{/* 예상 배당률 */}
<div className="mt-2 flex justify-between text-gray-400">
  <span>예상 배당률 (배팅 후)</span>
  <span className="text-blue-300 font-semibold">
    x{expectedOdds?.toFixed(2)}
  </span>
</div>

{/* 예상 보상 */}
<div className="mt-4 flex justify-between text-gray-400 border-t border-white/10 pt-3">
  <span>예상 보상</span>
  <span className="text-yellow-300 font-bold">{expectedReward} pt</span>
</div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>

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
