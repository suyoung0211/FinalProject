import { Button } from "../../components/ui/button";

const fmt = (v: any, d = 2) =>
  typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "-";

const fmtInt = (v: any) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.round(v).toLocaleString()
    : "-";

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
          <div className="text-white text-3xl font-bold">
            {fmtInt(amount)} pt
          </div>

          <div className="mt-4 flex justify-between text-gray-400">
            <span>현재 확률</span>
            <span className="text-white">{percent}%</span>
          </div>

          <div className="mt-2 flex justify-between text-gray-400">
            <span>현재 배당률</span>
            <span className="text-green-300 font-semibold">
              x{fmt(currentOdds)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-gray-400">
            <span>예상 배당률 (배팅 후)</span>
            <span className="text-blue-300 font-semibold">
              {expectedOdds == null
                ? "계산 중..."
                : `x${fmt(expectedOdds)}`}
            </span>
          </div>

          <div className="mt-4 flex justify-between text-gray-400 border-t border-white/10 pt-3">
            <span>예상 보상</span>
            <span className="text-yellow-300 font-bold">
              {expectedReward == null
                ? "-"
                : `${fmtInt(expectedReward)} pt`}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>

          <Button
            className="flex-1 bg-purple-600 text-white"
            onClick={() => onConfirm(choiceId)}
            disabled={expectedOdds == null}
          >
            투표 확정
          </Button>
        </div>
      </div>
    </div>
  );
}
