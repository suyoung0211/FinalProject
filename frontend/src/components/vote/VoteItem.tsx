import { useEffect, useState } from "react";
import { User, Coins } from "lucide-react";
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
              odds.choices?.find((o: any) => o.choiceId === c.choiceId)?.odds ??
              0,
          })),
        }));

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

  /* ===========================================================================
      🔢 전체 YES/NO 비율 (도넛)
    =========================================================================== */
  let totalYes = 0;
  let totalNo = 0;

  vote.options.forEach((opt: any) => {
    opt.choices.forEach((c: any) => {
      if (c.text === "YES") totalYes += c.participantsCount ?? 0;
      if (c.text === "NO") totalNo += c.participantsCount ?? 0;
    });
  });

  const total = totalYes + totalNo;
  const yesPercent = total > 0 ? Math.round((totalYes / total) * 100) : 50;
  const noPercent = 100 - yesPercent;

  /* ===========================================================================
      🔢 옵션별 YES/NO 비율 계산
    =========================================================================== */
  const optionsWithPercent = vote.options.map((opt: any) => {
    const yesChoice = opt.choices.find((c: any) => c.text === "YES");
    const noChoice = opt.choices.find((c: any) => c.text === "NO");

    const yes = yesChoice?.participantsCount ?? 0;
    const no = noChoice?.participantsCount ?? 0;

    const sum = yes + no;
    const percent = sum > 0 ? Math.round((yes / sum) * 100) : 50;

    return {
      ...opt,
      yes,
      no,
      percent, // yes 기준
    };
  });

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
      style={{ minHeight: "360px" }}
    >
      {/* ======================================================
          🔼 상단 제목 + 도넛 그래프
      ====================================================== */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {vote.thumbnail && (
            <img
              src={vote.thumbnail}
              alt="thumbnail"
              className="w-12 h-12 object-cover rounded-md"
            />
          )}
          <div className="w-48">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
              {vote.title}
            </h3>
          </div>
        </div>

        {/* 🔥 도넛 */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 flex items-center justify-center">

            {/* 비율 색 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(
              #22c55e ${yesPercent * 3.6}deg,
              #ef4444 0deg
            )`,
              }}
            />

            {/* 안쪽 구멍 */}
            <div className="absolute inset-2 bg-[#261b3a] rounded-full" />

            <div className="relative text-white font-bold text-sm">
              {yesPercent}%
            </div>
          </div>

          <span className="text-xs text-gray-400 mt-1">chance</span>
          <p className="text-gray-300 text-xs mt-1">{vote.category}</p>
        </div>
      </div>

      {/* ======================================================
          🔽 옵션 리스트 — 여러 개 가능
      ====================================================== */}
      <div className="mt-4 space-y-3">
        {optionsWithPercent.map((opt: any) => (
          <div
            key={opt.optionId}
            className="bg-white/5 border border-white/10 rounded-xl p-3"
          >
            {/* 옵션 제목 */}
            <div className="text-white font-semibold text-sm mb-2">
              {opt.title}
            </div>

            {/* YES / NO 막대 */}
            <div className="w-full h-3 rounded-full overflow-hidden flex">
              {/* YES */}
              <div
                className="h-full bg-green-500"
                style={{ width: `${opt.percent}%` }}
              />
              {/* NO */}
              <div
                className="h-full bg-red-500"
                style={{ width: `${100 - opt.percent}%` }}
              />
            </div>

            <div className="flex justify-between mt-1 text-xs font-semibold">
              <span className="text-green-400">YES {opt.percent}%</span>
              <span className="text-red-400">
                NO {100 - opt.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================
          🔽 하단 정보
      ====================================================== */}
      <div className="mt-4 flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-3">
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
