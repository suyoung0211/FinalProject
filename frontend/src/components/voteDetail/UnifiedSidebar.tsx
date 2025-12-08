// src/components/voteDetail/UnifiedSidebar.tsx

export function UnifiedSidebar({
  isAIVote,
  data,
  selectedAmount,
  setSelectedAmount,
  setShowVoteModal,
  handleParticipateNormal,
}: any) {
  const safeOptions = data?.options ?? [];
  const myParticipation = data?.myParticipation;

  /* 🔥 통계 처리 */
  const processedOptions = safeOptions.map((opt: any) => {
    const yes = opt.choices.find((c: any) => c.text === "YES")?.participantsCount ?? 0;
    const no = opt.choices.find((c: any) => c.text === "NO")?.participantsCount ?? 0;
    const draw = opt.choices.find((c: any) => c.text === "DRAW")?.participantsCount ?? 0;

    const sum = yes + no + draw;

    const yesP = sum ? Math.round((yes / sum) * 100) : 0;
    const noP = sum ? Math.round((no / sum) * 100) : 0;
    const drawP = sum ? 100 - yesP - noP : 0;

    return { ...opt, yes, no, draw, yesP, noP, drawP };
  });

  const myChoiceText =
    myParticipation?.choiceId &&
    safeOptions
      .flatMap((opt: any) => opt.choices)
      .find((c: any) => c.choiceId === myParticipation.choiceId)?.text;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">
      
      <h3 className="text-white font-semibold text-lg">
        {isAIVote ? "포인트 배팅" : "설문 참여하기"}
      </h3>

      {/* ======================================
         🔥 AI Vote UI
      ======================================= */}
      {isAIVote && (
        <>
          {processedOptions.map((opt: any) => (
            <div
              key={opt.optionId}
              className="bg-black/30 rounded-xl p-4 border border-white/10 mb-3"
            >
              <p className="text-white font-semibold mb-3">{opt.title}</p>

              {opt.choices.map((c: any) => (
                <button
  key={c.choiceId}
  onClick={() => setShowVoteModal(c.choiceId)}
  className={`
    w-full flex justify-between items-center rounded-lg px-3 py-3 mb-2 text-sm
    ${c.text === "YES" ? "bg-green-600/60 hover:bg-green-600/80 text-white" :
      c.text === "NO" ? "bg-red-600/60 hover:bg-red-600/80 text-white" :
      "bg-gray-500/50 hover:bg-gray-500/70 text-white"}

    ${myParticipation?.choiceId === c.choiceId ? "ring-2 ring-yellow-400 scale-[1.02]" : ""}
  `}
>
  <span>{c.text}</span>
  <span className="text-xs opacity-80">
    {c.percent ?? 0}% / {c.participantsCount}명
  </span>
</button>
              ))}

              {/* 비율 바 */}
              <div className="mt-3 w-full h-3 rounded-full overflow-hidden flex bg-white/10">
                <div style={{ width: `${opt.yesP}%`, background: "#22c55e" }} />
                {opt.draw > 0 && (
                  <div style={{ width: `${opt.drawP}%`, background: "#9ca3af" }} />
                )}
                <div style={{ width: `${opt.noP}%`, background: "#ef4444" }} />
              </div>
            </div>
          ))}

          {/* 금액 선택 */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`p-2 rounded-lg ${
                  selectedAmount === amt ? "bg-purple-600 text-white" : "bg-white/10 text-gray-300"
                }`}
              >
                {amt}pt
              </button>
            ))}
          </div>

          {/* 직접 입력 */}
          <input
            type="number"
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(Number(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white"
          />

          {/* 🟣 내 배팅 정보 */}
          {myParticipation?.hasParticipated && (
            <div className="bg-purple-800/40 border border-purple-500/30 rounded-xl p-4 mt-3 text-xs text-gray-300">
              <div>
                선택:{" "}
                <span className="text-white font-bold">{myChoiceText}</span>
              </div>
              <div>배팅: {myParticipation.pointsBet} pt</div>
              <div>배당률: x{myParticipation.expectedOdds?.toFixed(2)}</div>
              {myParticipation.expectedReward && (
                <div>예상 수익: {myParticipation.expectedReward} pt</div>
              )}
            </div>
          )}
        </>
      )}

      {/* =====================================================
    🔵 NORMAL VOTE (업그레이드 UI)
===================================================== */}
{!isAIVote && (
  <>
    {safeOptions.map((opt: any) => (
      <div
        key={opt.optionId}
        className="bg-black/30 rounded-xl p-5 border border-white/10 space-y-4 mb-6"
      >
        <p className="text-white font-semibold text-base mb-3">{opt.optionTitle}</p>

        <div className="flex flex-col gap-3">
          {opt.choices?.map((ch: any) => {
            const isSelected = myParticipation?.choiceId === ch.choiceId;

            return (
              <button
                key={ch.choiceId}
                onClick={() => handleParticipateNormal(opt.optionId, ch.choiceId)}
                className={`
                  w-full flex justify-between items-center px-4 py-3 rounded-lg 
                  text-sm font-medium transition-all duration-150

                  ${
                    isSelected
                      ? "bg-purple-600/60 ring-2 ring-purple-300 text-white scale-[1.02]"
                      : "bg-purple-500/30 hover:bg-purple-500/50 text-purple-100"
                  }
                `}
              >
                <span>{ch.choiceText ?? ch.text}</span>
                <span className="text-xs opacity-80">{ch.participantsCount ?? 0}명</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </>
)}
    </div>
  );
}
