import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

interface VoteItemProps {
  voteId: number;
  initialVote: any;
  onMarketClick: (id: number, type: "AI") => void;
}

export function VoteItem({ voteId, onMarketClick, initialVote }: VoteItemProps) {
  const [vote, setVote] = useState<any>(initialVote ?? null);
  const [loading, setLoading] = useState(!initialVote);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const isFinished =
  vote?.status === "FINISHED" ||
  vote?.status === "RESOLVED" ||
  vote?.status === "REWARDED";

  const thumbnail = vote?.article?.thumbnailUrl ?? "/default-thumb.png";

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
              odds.choices?.find((o: any) => o.choiceId === c.choiceId)?.odds ?? 0,
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

  /* =========================================================
      🔥 종료된 AI 투표 UI
     ========================================================= */
  if (isFinished) {
    return (
      <div
        onClick={() => onMarketClick(vote.id, "AI")}
        className="
          flex flex-col rounded-2xl p-4 cursor-pointer 
          bg-gray-700/40 border border-gray-500/40 
          hover:bg-gray-600/40 transition
        "
      >

        {/* 🔥 썸네일 */}
        <div className="w-full h-40 mb-3 rounded-xl overflow-hidden">
          <img
            src={thumbnail}
            alt="thumbnail"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <h3 className="text-gray-200 font-bold text-lg mb-4">{vote.title}</h3>

        <div className="bg-gray-800/60 text-gray-200 border border-gray-500/40 
                        rounded-xl p-6 text-center font-semibold">
          🏁 투표가 종료되었습니다!
        </div>

        <div className="mt-4 flex justify-between items-center text-gray-300 text-xs pt-2 border-t border-gray-500/40">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {vote.totalParticipants ?? 0} 참가자
          </span>

          <span>마감: {vote.endAt?.substring(0, 10) ?? "미정"}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarketClick(vote.id, "AI");
          }}
          className="
            mt-3 bg-gray-600 text-white font-bold px-5 py-2.5 
            rounded-xl text-sm shadow-md hover:bg-gray-500 transition
          "
        >
          결과 보기
        </button>
      </div>
    );
  }

  /* =========================================================
      🔥 진행중인 AI 투표 UI
     ========================================================= */

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

  const optionsWithPercent = (vote.options || []).map((opt: any) => {
    const yes = opt.choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
    const draw = opt.choices.find((c: any) => c.text === "DRAW")?.participantsCount ?? 0;
    const no = opt.choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;

    const sum = yes + draw + no;

    const yesP = sum > 0 ? Math.round((yes / sum) * 100) : 33;
    const drawP = sum > 0 ? Math.round((draw / sum) * 100) : 33;
    const noP = 100 - yesP - drawP;

    return { ...opt, yesP, drawP, noP, sum };
  });

  const visibleOptions =
    optionsWithPercent.length > 2 && !showAllOptions
      ? optionsWithPercent.slice(0, 2)
      : optionsWithPercent;

  const yesDeg = yesPercent * 3.6;
  const drawDeg = drawPercent * 3.6;

  return (
    <div
      onClick={() => onMarketClick(vote.id, "AI")}
      className="flex flex-col rounded-2xl p-4 cursor-pointer bg-[#261b3a] border border-purple-700/30 hover:bg-[#381f5c]"
    >

      {/* 🔥 썸네일 */}
      <div className="w-full h-40 mb-3 rounded-xl overflow-hidden">
        <img
          src={thumbnail}
          alt="thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      {/* HEADER */}
      <div className="flex justify-between pb-3">
        <h3 className="text-white font-bold text-lg flex-1">{vote.title}</h3>

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

      {/* OPTIONS */}
      <div className="flex-1">
        {visibleOptions.map((opt: any) => (
          <div
            key={opt.optionId}
            className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3"
          >
            <p className="text-white font-semibold text-sm mb-2">{opt.title}</p>

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
          </div>
        ))}

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
