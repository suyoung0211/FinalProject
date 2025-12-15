// src/components/voteDetail/VoteModal.tsx

import { Button } from "../../components/ui/button";

/* ===============================
   Formatter
================================ */
const fmt = (v: any, d = 2) =>
  typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "-";

const fmtInt = (v: any) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.round(v).toLocaleString()
    : "-";

const fmtPercent = (v: any) =>
  typeof v === "number" && Number.isFinite(v)
    ? `${v.toFixed(1)}%`
    : "-";

/* ===============================
   VoteModal
================================ */
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
  const isCalculating = expectedOdds == null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/20 w-full max-w-md">

        {/* TITLE */}
        <h2 className="text-white text-2xl font-bold mb-6">
          투표 확인
        </h2>

        {/* INFO CARD */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">

          {/* BET AMOUNT */}
          <div>
            <div className="text-gray-400 text-sm">배팅 포인트</div>
            <div className="text-white text-3xl font-bold">
              {fmtInt(amount)} pt
            </div>
          </div>

          {/* CURRENT PROBABILITY */}
          <div className="flex justify-between text-gray-400">
            <span>현재 확률</span>
            <span className="text-white font-semibold">
              {fmtPercent(percent)}
            </span>
          </div>

          {/* CURRENT ODDS */}
          <div className="flex justify-between text-gray-400">
            <span>현재 배당률</span>
            <span className="text-green-300 font-semibold">
              x{fmt(currentOdds)}
            </span>
          </div>

          {/* EXPECTED ODDS */}
          <div className="flex justify-between text-gray-400">
            <span>예상 배당률 (배팅 후)</span>
            <span
              className={`font-semibold ${
                isCalculating
                  ? "text-gray-400"
                  : "text-blue-300"
              }`}
            >
              {isCalculating
                ? "계산 중..."
                : `x${fmt(expectedOdds)}`}
            </span>
          </div>

          {/* EXPECTED REWARD */}
          <div className="flex justify-between text-gray-400 border-t border-white/10 pt-3">
            <span>예상 보상</span>
            <span className="text-yellow-300 font-bold">
              {isCalculating
                ? "-"
                : `${fmtInt(expectedReward)} pt`}
            </span>
          </div>

          {/* NOTICE */}
          <div className="text-[11px] text-gray-500 leading-relaxed">
            · 배당률은 실시간으로 변동될 수 있습니다.<br />
            · 최대 배당률은 <b className="text-gray-300">10배</b>로 제한됩니다.
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>

          <Button
            className={`flex-1 ${
              isCalculating
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
            onClick={() => onConfirm(choiceId)}
            disabled={isCalculating}
          >
            투표 확정
          </Button>
        </div>
      </div>
    </div>
  );
}
