import { useEffect, useState } from "react";
import { User, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

export function VoteItem({
  voteId,
  onMarketClick,
}: {
  voteId: number;
  onMarketClick: (id: number) => void;
}) {
  const [vote, setVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /** 🔥 API 호출 */
  useEffect(() => {
    async function load() {
      try {
        const detailRes = await fetchVoteDetail(voteId);
        const oddsRes = await fetchVoteOdds(voteId);

        const detail = detailRes.data;
        const odds = oddsRes.data;

        // 선택지에 odds 매핑
        const mergedOptions = detail.options.map((opt: any) => ({
  ...opt,
  choices: opt.choices.map((c: any) => ({
    ...c,
    percentage:
      odds.choices?.find((o: any) => o.choiceId === c.choiceId)?.odds ?? 0,
  })),
}));
        console.log("🔥 [FRONT] voteId=", voteId);
console.log("🔥 [FRONT] fetchVoteDetail 응답:", detail);
console.log("🔥 [FRONT] fetchVoteOdds 응답:", odds);
console.log("🔥 [FRONT] 선택지 매핑 결과:", mergedOptions);

        setVote({ ...detail, options: mergedOptions });
      } catch (err) {
        console.error("VoteItem load error:", err);
      }
      setLoading(false);
    }

    load();
  }, [voteId]);

  if (loading || !vote) {
    return (
      <div className="bg-white/5 p-6 rounded-2xl text-gray-400">로딩 중...</div>
    );
  }

  /** 🔢 확률 계산 (Yes/No only) */
  const yesChoice = vote.options[0]?.choices.find((c: any) => c.text === "YES");
  const noChoice  = vote.options[0]?.choices.find((c: any) => c.text === "NO");

  const yes = yesChoice?.percentage ?? 0;
  const no  = noChoice?.percentage ?? 0;

  const total = yes + no;
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 50;
  const noPercent  = total > 0 ? 100 - yesPercent : 50;
  const circleColor = yesPercent > noPercent ? "border-green-500 text-green-400" : "border-red-500 text-red-400";

  return (
  <div
    onClick={() => onMarketClick(vote.id)}
    className="
      flex flex-col 
      rounded-2xl p-5 cursor-pointer transition-all
      bg-[#261b3a] 
      border border-purple-700/30
      hover:bg-[#381f5c] 
      hover:border-purple-400/50
    "
    style={{ height: "340px" }}
  >
    {/* ====== 상단 헤더 ====== */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        {vote.thumbnail && (
          <img
            src={vote.thumbnail}
            alt="thumbnail"
            className="w-12 h-12 object-cover rounded-md"
          />
        )}
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{vote.title}</h3>
          
        </div>
      </div>

      {/* 확률 원 */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold ${circleColor}`}
        >
          {yesPercent}%
        </div>
        <span className="text-xs text-gray-400 mt-1">chance</span>
        <p className="text-gray-300 text-xs mt-1">{vote.category}</p>
      </div>
    </div>

    {/* ====== 자동 여백 → YES/NO 바를 아래로 밀어냄 ====== */}
    <div className="flex-1"></div>

    {/* ====== YES / NO 바 (항상 아래 고정) ====== */}
    <div className="mt-4">
      <div className="flex w-full">
        <div className="bg-green-600/20 text-green-400 px-4 py-2 w-1/2 rounded-l-xl font-semibold text-center">
          Yes ({yesPercent}%)
        </div>
        <div className="bg-red-600/20 text-red-400 px-4 py-2 w-1/2 rounded-r-xl font-semibold text-center">
          No ({noPercent}%)
        </div>
      </div>
    </div>

    {/* ====== 하단 정보 ====== */}
    <div className="mt-3 flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Coins className="w-3 h-3" />
          {(vote.totalPoints / 1000).toFixed(1)}k Vol.
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {vote.totalParticipants}
        </span>
      </div>
      <span>마감: {vote.endAt.substring(0, 10)}</span>
    </div>
  </div>
);
}
