/* ================================================================
   DRAW UI 적용 + 3단 바 + 도넛 3분할 적용된 최종 VoteItem
================================================================ */

import { useEffect, useState } from "react";
import { User, Coins } from "lucide-react";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

export function VoteItem({ voteId, onMarketClick, initialVote }: any) {
  const [vote, setVote] = useState<any>(initialVote ?? null);
  const [loading, setLoading] = useState(!initialVote);

  /* ------------------------------------------------------------- */
  /* 🔥 AI 투표 상세 로드 */
  /* ------------------------------------------------------------- */
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
    return <div className="bg-white/5 p-6 rounded-2xl text-gray-400">로딩 중...</div>;
  }

  /* ------------------------------------------------------------- */
  /* 🔢 전체 YES / DRAW / NO 계산 */
  /* ------------------------------------------------------------- */
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

  const totalVotes = totalYes + totalDraw + totalNo;
  const yesPercent = totalVotes ? Math.round((totalYes / totalVotes) * 100) : 33;
  const drawPercent = totalVotes ? Math.round((totalDraw / totalVotes) * 100) : 33;
  const noPercent = totalVotes ? 100 - yesPercent - drawPercent : 34;

  /* ------------------------------------------------------------- */
  /* 🔢 옵션별 비율 계산 */
  /* ------------------------------------------------------------- */
  const optionsWithPercent = (vote.options || []).map((opt: any) => {
    const yes = opt.choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
    const draw = opt.choices.find((c: any) => c.text === "DRAW")?.participantsCount ?? 0;
    const no = opt.choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;

    const sum = yes + draw + no;

    const yesP = sum > 0 ? Math.round((yes / sum) * 100) : 33;
    const drawP = sum > 0 ? Math.round((draw / sum) * 100) : 33;
    const noP = sum > 0 ? 100 - yesP - drawP : 34;

    return { ...opt, yes, draw, no, yesP, drawP, noP, sum };
  });

  /* ------------------------------------------------------------- */
  /* 🔥 옵션 UI 렌더링 (YES/NO + DRAW 지원) */
  /* ------------------------------------------------------------- */
  const renderOptions = () => {
    const opt = optionsWithPercent[0];
    const choices = opt?.choices || [];

    /* 옵션 1개 */
    if (optionsWithPercent.length === 1) {
      return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mt-3">

          {/* YES / NO only */}
          {choices.length === 2 && (
            <>
              <div className="w-full h-8 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full"
                  style={{
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
                <span className="text-red-400">NO {opt.noP}%</span>
              </div>
            </>
          )}

          {/* YES / DRAW / NO (3단 바) */}
          {choices.length === 3 && (
            <>
              <div className="w-full h-6 rounded-full overflow-hidden flex bg-white/10 shadow-inner">
                <div style={{ width: `${opt.yesP}%`, background: "#22c55e" }} />
                <div style={{ width: `${opt.drawP}%`, background: "#9ca3af" }} />
                <div style={{ width: `${opt.noP}%`, background: "#ef4444" }} />
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

    /* 옵션 여러 개 → 각 옵션에 DRAW 포함되면 자동으로 3단 바 적용 */
    return optionsWithPercent.map((opt : any) => {
      const hasDraw = opt.draw > 0;

      return (
        <div key={opt.optionId} className="bg-white/5 border border-white/10 rounded-xl p-1 mb-3">
          <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

          {/* DRAW 있는 경우 → 3단 */}
          {hasDraw ? (
            <>
              <div className="w-full h-5 rounded-full overflow-hidden flex bg-white/10 shadow-inner ">
                <div style={{ width: `${opt.yesP}%`, background: "#22c55e" }} />
                <div style={{ width: `${opt.drawP}%`, background: "#9ca3af" }} />
                <div style={{ width: `${opt.noP}%`, background: "#ef4444" }} />
              </div>

              <div className="flex justify-between mt-2 text-xs font-semibold px-1">
                <span className="text-green-400">YES {opt.yesP}%</span>
                <span className="text-gray-300">DRAW {opt.drawP}%</span>
                <span className="text-red-400">NO {opt.noP}%</span>
              </div>
            </>
          ) : (
            /* DRAW 없는 경우 → 기존 YES/NO 바 */
            <>
              <div className="w-full h-5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full"
                  style={{
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
                <span className="text-red-400">NO {opt.noP}%</span>
              </div>
            </>
          )}
        </div>
      );
    });
  };

  /* ------------------------------------------------------------- */
  /* 🔥 최종 UI */
  /* ------------------------------------------------------------- */

  const yesDeg = yesPercent * 3.6;
  const drawDeg = drawPercent * 3.6;

  return (
    <div
      onClick={() => onMarketClick(vote.id)}
      className="flex flex-col rounded-2xl p-4 cursor-pointer bg-[#261b3a] border border-purple-700/30 hover:bg-[#381f5c]"
      style={{ minHeight: "300px" }}
    >
      {/* HEADER */}
      <div className="flex justify-between pb-3">
        <h3 className="text-white font-bold text-lg flex-1">{vote.title}</h3>

        {/* 도넛 3단 */}
        <div className="flex flex-col items-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  conic-gradient(
                    #22c55e ${yesDeg}deg,
                    #9ca3af ${yesDeg}deg ${yesDeg + drawDeg}deg,
                    #ef4444 ${yesDeg + drawDeg}deg 360deg
                  )
                `,
              }}
            />
            <div className="absolute inset-2 bg-[#261b3a] rounded-full" />
            {/* <div className="relative text-white font-bold text-xs">{yesPercent}%</div> */}
          </div>
          {/* <span className="text-xs text-gray-400 mt-1">chance</span> */}
        </div>
      </div>

      {/* OPTIONS */}
      <div className="flex-1 flex flex-col justify-end">{renderOptions()}</div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-gray-300 text-xs border-t border-white/10 pt-2 mt-3">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {vote.totalParticipants ?? 0} 참가자
        </span>

        <span>마감: {vote.endAt?.substring(0, 10) ?? "미정"}</span>

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
