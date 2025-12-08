/* ================================================================
   DRAW UI + 도넛 3분할 + 옵션 접기/펼치기 적용된 최종 VoteItem
================================================================ */

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

/* -------------------------------------------------------------
   🔥 타입 정의
------------------------------------------------------------- */
interface VoteItemProps {
  voteId: number;
  initialVote: any;
  onMarketClick: (id: number, type: "AI") => void;
}

export function VoteItem({ voteId, onMarketClick, initialVote }: VoteItemProps) {
  console.log("🔵 VoteItem initialVote:", initialVote);
  console.log("🔵 VoteItem voteId:", voteId);
  const [vote, setVote] = useState<any>(initialVote ?? null);
  const [loading, setLoading] = useState(!initialVote);
  const [showAllOptions, setShowAllOptions] = useState(false);
  useEffect(() => {
  console.log("🔵 VoteItem loaded vote:", vote);
}, [vote]);

  /* ------------------------------------------------------------- */
  /* 🔥 AI 투표 상세 로드 */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    if (initialVote?.type === "NORMAL") return; // Normal vote는 여기 사용하지 않음

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
      <div className="bg-white/5 p-6 rounded-2xl text-gray-400">
        로딩 중...
      </div>
    );
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
  /* 🔥 옵션 카드 렌더링 함수 */
  /* ------------------------------------------------------------- */
  const renderOptionCard = (opt: any) => {
    const hasDraw = opt.draw > 0;

    return (
      <div key={opt.optionId} className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
        <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

        {/* DRAW 있음 → 3분할 BAR */}
        {hasDraw ? (
          <>
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-white/10 shadow-inner">
              <div style={{ width: `${opt.yesP}%`, background: "#22c55e" }} />
              <div style={{ width: `${opt.drawP}%`, background: "#9ca3af" }} />
              <div style={{ width: `${opt.noP}%`, background: "#ef4444" }} />
            </div>

            <div className="grid grid-cols-3 text-xs font-semibold text-center mt-1">
              <span className="text-green-400">YES {opt.yesP}%</span>
              <span className="text-gray-300">DRAW {opt.drawP}%</span>
              <span className="text-red-400">NO {opt.noP}%</span>
            </div>
          </>
        ) : (
          /* 기존 YES/NO 바 */
          <>
            <div className="w-full h-6 rounded-full overflow-hidden bg-white/10 shadow-inner">
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

            <div className="flex justify-between text-xs font-semibold mt-1 px-1">
              <span className="text-green-400">YES {opt.yesP}%</span>
              <span className="text-red-400">NO {opt.noP}%</span>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ------------------------------------------------------------- */
  /* 🔥 옵션 접기/펼치기 적용 */
  /* ------------------------------------------------------------- */
  const visibleOptions =
    optionsWithPercent.length > 2 && !showAllOptions
      ? optionsWithPercent.slice(0, 2)
      : optionsWithPercent;

  /* ------------------------------------------------------------- */
  /* 🔥 도넛 각도 계산 */
  /* ------------------------------------------------------------- */
  const yesDeg = yesPercent * 3.6;
  const drawDeg = drawPercent * 3.6;

  /* ------------------------------------------------------------- */
  /* 🔥 최종 UI */
  /* ------------------------------------------------------------- */
  return (
    <div
      onClick={() => onMarketClick(vote.id, "AI")}
      className="flex flex-col rounded-2xl p-4 cursor-pointer bg-[#261b3a] border border-purple-700/30 hover:bg-[#381f5c]"
    >
      {/* HEADER */}
      <div className="flex justify-between pb-3">
        <h3 className="text-white font-bold text-lg flex-1">{vote.title}</h3>

        {/* 도넛 그래프 */}
        <div className="flex flex-col items-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  conic-gradient(
                    #22c55e 0deg ${yesDeg}deg,
                    #9ca3af ${yesDeg}deg ${yesDeg + drawDeg}deg,
                    #ef4444 ${yesDeg + drawDeg}deg 360deg
                  )
                `,
              }}
            />
            <div className="absolute inset-2 bg-[#261b3a] rounded-full" />
          </div>
        </div>
      </div>

      {/* OPTIONS */}
      <div className="flex-1">
        {visibleOptions.map(renderOptionCard)}

        {/* 옵션 더보기 */}
        {optionsWithPercent.length > 2 && (
          <button
            className="w-full text-center py-2 text-sm text-purple-300 hover:text-purple-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllOptions((prev) => !prev);
            }}
          >
            {showAllOptions ? "접기 ▲" : `옵션 더보기 (${optionsWithPercent.length - 2}개) ▼`}
          </button>
        )}
      </div>

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
            onMarketClick(vote.id, "AI");
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
