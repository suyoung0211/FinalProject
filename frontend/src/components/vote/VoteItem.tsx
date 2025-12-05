import { useEffect, useState } from "react";
import { User, Coins } from "lucide-react";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

export function VoteItem({ voteId, onMarketClick, initialVote }: any) {
  const [vote, setVote] = useState<any>(initialVote ?? null);
  const [loading, setLoading] = useState(!initialVote);

  /* ------------------------------------------------------------------ */
  /* 🔥 LOAD DETAIL (AI 전용) */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (initialVote?.type === "NORMAL") return;

    async function load() {
      try {
        const detailRes = await fetchVoteDetail(voteId);
        const oddsRes = await fetchVoteOdds(voteId);

        const detail = detailRes.data;
        const odds = oddsRes.data;

        const mergedOptions = detail.options.map((opt: any) => ({
          ...opt,
          choices: opt.choices.map((c: any) => ({
            ...c,
            percentage:
              odds.choices?.find((o: any) => o.choiceId === c.choiceId)?.odds ??
              0,
          })),
        }));

        setVote({
          ...initialVote,
          ...detail,
          options: mergedOptions,
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    load();
  }, [voteId]);

  if (!vote) {
    return (
      <div className="bg-white/5 p-6 rounded-2xl text-gray-400">로딩 중...</div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* 🔢 전체 YES/NO 계산 */
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

  /* ====================================================================== */
  /* 🔥 옵션 렌더링 (옵션 1개 → YES/NO/DRAW 지원) */
  /* ====================================================================== */

  const renderOptions = () => {
    /* 옵션이 하나일 경우 */
    if (optionsWithPercent.length === 1) {
      const opt = optionsWithPercent[0];
      const choices = opt.choices || [];

      /* YES / NO */
      if (choices.length === 2) {
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

      /* YES / DRAW / NO */
      if (choices.length === 3) {
        const yes =
          choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
        const draw =
          choices.find((c: any) => c.text === "DRAW")?.participantsCount ?? 0;
        const no =
          choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;

        const sum = yes + draw + no;
        const yesP = sum ? Math.round((yes / sum) * 100) : 33;
        const drawP = sum ? Math.round((draw / sum) * 100) : 33;
        const noP = 100 - yesP - drawP;

        return (
          <div className="relative mt-3 space-y-2">
            <div className="w-full h-4 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${yesP}%`,
                  background: "linear-gradient(to right, #22c55e, #16a34a)",
                }}
              />
              <div
                style={{
                  width: `${drawP}%`,
                  background: "linear-gradient(to right, #9ca3af, #6b7280)",
                }}
              />
              <div
                style={{
                  width: `${noP}%`,
                  background: "linear-gradient(to right, #ef4444, #dc2626)",
                }}
              />
            </div>

            <div className="grid grid-cols-3 text-xs font-semibold text-center">
              <span className="text-green-400">YES {yesP}%</span>
              <span className="text-gray-300">DRAW {drawP}%</span>
              <span className="text-red-400">NO {noP}%</span>
            </div>
          </div>
        );
      }
    }

    /* 옵션 여러 개일 때 */
    return optionsWithPercent.map((opt: any) => (
      <div
        key={opt.optionId}
        className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3"
      >
        <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

        <div>
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
      </div>
    ));
  };

  /* ====================================================================== */
  /* 🔥 RETURN – 최종 카드 UI */
  /* ====================================================================== */

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
      {/* 상단 헤더 */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3 flex-1">
          {vote.thumbnail && (
            <img
              src={vote.thumbnail}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}

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

      {/* ====================================================== */}
      {/* 🔥 하단 FOOTER + 투표 버튼 이동 */}
      {/* ====================================================== */}
      <div className="mt-auto flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-2">
        
        {/* 왼쪽 정보 */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {(vote.totalPoints / 1000).toFixed(1)}k Vol.
          </span>

          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {vote.totalParticipants ??
              initialVote?.totalParticipants ??
              0} 참가자 수
          </span>

          <span>마감: {vote.endAt ? vote.endAt.substring(0, 10) : "미정"}</span>
        </div>

        {/* 오른쪽 투표 버튼 */}
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
