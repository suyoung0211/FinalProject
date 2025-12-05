import { User, Coins } from "lucide-react";

interface NormalVoteItemProps {
  vote: any;
  onMarketClick: (id: number) => void;
}

export function NormalVoteItem({ vote, onMarketClick }: NormalVoteItemProps) {
  /* ------------------------------------------------------------------ */
  /* 🔢 YES / DRAW / NO 계산 (전체 도넛 계산용) */
  /* ------------------------------------------------------------------ */
  let totalYes = 0;
  let totalDraw = 0;
  let totalNo = 0;

  (vote.options || []).forEach((opt: any) => {
    (opt.choices || []).forEach((c: any) => {
      if (c.text === "YES") totalYes += c.participantsCount ?? 0;
      if (c.text === "DRAW") totalDraw += c.participantsCount ?? 0;
      if (c.text === "NO") totalNo += c.participantsCount ?? 0;
    });
  });

  const totalSum = totalYes + totalDraw + totalNo;

  const yesPercent = totalSum ? Math.round((totalYes / totalSum) * 100) : 33;
  const drawPercent = totalSum ? Math.round((totalDraw / totalSum) * 100) : 33;
  const noPercent = totalSum ? 100 - yesPercent - drawPercent : 34;

  /* ------------------------------------------------------------------ */
  /* 🔢 옵션별 비율 계산 */
  /* ------------------------------------------------------------------ */
  const optionsWithPercent = (vote.options || []).map((opt: any) => {
    const yes = opt.choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
    const draw = opt.choices.find((c: any) => c.text === "DRAW")?.participantsCount ?? 0;
    const no = opt.choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;

    const sum = yes + draw + no;

    const yesP = sum > 0 ? Math.round((yes / sum) * 100) : 33;
    const drawP = sum > 0 ? Math.round((draw / sum) * 100) : 33;
    const noP = sum > 0 ? 100 - yesP - drawP : 34;

    return {
      ...opt,
      yes,
      draw,
      no,
      yesP,
      drawP,
      noP,
      sum,
    };
  });

  /* ------------------------------------------------------------------ */
  /* 🔥 옵션 렌더링 */
  /* ------------------------------------------------------------------ */
  const renderOptions = () => {
    const opt = optionsWithPercent[0];
    const choices = opt?.choices || [];

    /* 옵션이 하나일 때 */
    if (optionsWithPercent.length === 1) {
      return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3 mt-3 mb-3">

          {/* YES / NO */}
          {choices.length === 2 && (
            <>
              <div className="w-full h-7 rounded-full overflow-hidden shadow-inner bg-white/10">
                <div
                  className="h-full"
                  style={{
                    width: "100%",
                    background: `
                      linear-gradient(
                        to right,
                        #22c55e ${opt.yesP}%,
                        #ef4444 ${opt.yesP}%
                      )
                    `,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs font-semibold px-1">
                <span className="text-green-400">YES {opt.yesP}%</span>
                <span className="text-red-400">NO {100 - opt.yesP}%</span>
              </div>
            </>
          )}

          {/* YES / DRAW / NO */}
          {choices.length === 3 && (
            <>
              <div className="w-full h-7 rounded-full overflow-hidden flex bg-white/10 shadow-inner">
                <div
                  style={{
                    width: `${opt.yesP}%`,
                    background: "linear-gradient(to right, #22c55e, #16a34a)",
                  }}
                />
                <div
                  style={{
                    width: `${opt.drawP}%`,
                    background: "linear-gradient(to right, #9ca3af, #6b7280)",
                  }}
                />
                <div
                  style={{
                    width: `${opt.noP}%`,
                    background: "linear-gradient(to right, #ef4444, #dc2626)",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 text-xs font-semibold text-center">
                <span className="text-green-400">YES {opt.yesP}%</span>
                <span className="text-gray-300">DRAW {opt.drawP}%</span>
                <span className="text-red-400">NO {opt.noP}%</span>
              </div>
            </>
          )}
        </div>
      );
    }

    /* 옵션 여러 개일 때 */
    return optionsWithPercent.map((opt: any) => (
      <div
        key={opt.optionId}
        className="bg-white/5 border border-white/10 rounded-xl p-1 mb-3"
      >
        <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

        <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full"
            style={{
              width: "100%",
              background: `
                linear-gradient(
                  to right,
                  #22c55e ${opt.yesP}%,
                  #ef4444 ${opt.yesP}%
                )
              `,
            }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs font-semibold px-1">
          <span className="text-green-400">YES {opt.yesP}%</span>
          <span className="text-red-400">NO {100 - opt.yesP}%</span>
        </div>
      </div>
    ));
  };

  /* ------------------------------------------------------------------ */
  /* 🔥 RETURN – 최종 카드 UI */
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
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
            {vote.title}
          </h3>
        </div>

        {/* DONUT */}
        <div className="flex flex-col items-center">
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `conic-gradient(
          #22c55e 0deg calc(${yesPercent} * 3.6deg),
          #9ca3af calc(${yesPercent} * 3.6deg) calc((${yesPercent} + ${drawPercent}) * 3.6deg),
          #ef4444 calc((${yesPercent} + ${drawPercent}) * 3.6deg) 360deg
        )`,
      }}
    />
    <div className="absolute inset-3 bg-[#261b3a] rounded-full" />
  </div>
</div>
      </div>

      {/* OPTIONS */}
      <div className="flex-1 flex flex-col justify-end">{renderOptions()}</div>

      {/* FOOTER */}
      <div className="mt-auto flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {vote.totalParticipants ?? 0} 참가자
          </span>
          <span>마감: {vote.endAt?.substring(0, 10) ?? "미정"}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarketClick(vote.id);
          }}
          className="
  bg-gradient-to-r from-purple-500 to-pink-500
  text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg
  hover:opacity-90 transform hover:scale-[1.03] transition
"
        >
          투표하러가기
        </button>
      </div>
    </div>
  );
}
