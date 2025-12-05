import { User, Coins } from "lucide-react";

interface NormalVoteItemProps {
  vote: any;
  onMarketClick: (id: number) => void;
}

export function NormalVoteItem({ vote, onMarketClick }: NormalVoteItemProps) {
  /* ------------------------------------------------------------------ */
  /* 🔢 YES/NO 비율 계산 */
  /* ------------------------------------------------------------------ */
  let totalYes = 0;
  let totalNo = 0;

  (vote.options || []).forEach((opt: any) => {
    (opt.choices || []).forEach((c: any) => {
      if (c.text === "YES") totalYes += c.participantsCount ?? 0;
      if (c.text === "NO") totalNo += c.participantsCount ?? 0;
    });
  });

  const totalVotes = totalYes + totalNo;
  const yesPercent =
    totalVotes > 0 ? Math.round((totalYes / totalVotes) * 100) : 50;

  /* 옵션별 비율 계산 */
  const optionsWithPercent = (vote.options || []).map((opt: any) => {
    const yes =
      opt.choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
    const no =
      opt.choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;
    const sum = yes + no;
    const percent = sum > 0 ? Math.round((yes / sum) * 100) : 50;
    return { ...opt, yes, no, percent };
  });

  /* ------------------------------------------------------------------ */
  /* 🔥 옵션 렌더링 */
  /* ------------------------------------------------------------------ */
  const renderOptions = () => {
    // 옵션 1개 → YES/NO
    if (optionsWithPercent.length === 1) {
      const opt = optionsWithPercent[0];

      return (
        <div className="relative mt-3">
          <div className="w-full h-8 rounded-full overflow-hidden shadow-inner bg-white/10">
            <div
              className="h-full"
              style={{
                width: "100%",
                background: `
                  linear-gradient(
                    to right,
                    #22c55e ${opt.percent}%,
                    #ef4444 ${opt.percent}%
                  )
                `,
                transition: "background 0.3s ease",
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs font-semibold px-1">
            <span className="text-green-400">YES {opt.percent}%</span>
            <span className="text-red-400">NO {100 - opt.percent}%</span>
          </div>
        </div>
      );
    }

    // 옵션 여러 개
    return optionsWithPercent.map((opt: any) => (
      <div
        key={opt.optionId}
        className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3"
      >
        <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

        <div className="w-full h-5 bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full"
            style={{
              width: "100%",
              background: `
                linear-gradient(
                  to right,
                  #22c55e ${opt.percent}%,
                  #ef4444 ${opt.percent}%
                )
              `,
              transition: "background 0.3s ease",
            }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs font-semibold px-1">
          <span className="text-green-400">YES {opt.percent}%</span>
          <span className="text-red-400">NO {100 - opt.percent}%</span>
        </div>
      </div>
    ));
  };

  /* ------------------------------------------------------------------ */
  /* 🔥 RETURN – 전체 UI */
  /* ------------------------------------------------------------------ */
  return (
    <div
      onClick={() => onMarketClick(vote.id)}
      className="
        flex flex-col 
        rounded-2xl p-4 cursor-pointer 
        bg-[#261b3a]
        border border-purple-700/30
        hover:bg-[#381f5c] 
        hover:border-purple-400/50
      "
      style={{ minHeight: "300px" }}
    >
      {/* 상단 제목 */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
            {vote.title}
          </h3>
        </div>

        {/* 도넛 */}
        <div className="flex flex-col items-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#22c55e ${
                  yesPercent * 3.6
                }deg, #ef4444 0deg)`,
              }}
            />
            <div className="absolute inset-2 bg-[#261b3a] rounded-full" />
            <div className="relative text-white font-bold text-xs">
              {yesPercent}%
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-1">chance</span>
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex-1 flex flex-col justify-end">{renderOptions()}</div>

      {/* FOOTER */}
      <div className="mt-auto flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-2">

        {/* 왼쪽 정보들 */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {vote.totalParticipants ?? 0} 참가자 수
          </span>

          <span>
            마감: {vote.deadline ? vote.deadline.substring(0, 10) : "미정"}
          </span>
        </div>

        {/* 오른쪽 “투표하러가기” 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarketClick(vote.id);
          }}
          className="
            bg-gradient-to-r from-purple-500 to-pink-500
            text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow
            hover:opacity-90
          "
        >
          투표하러가기
        </button>
      </div>
    </div>
  );
}
