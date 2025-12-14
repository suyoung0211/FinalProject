// src/components/voteDetail/UnifiedSidebar.tsx

export function UnifiedSidebar({
  isAIVote,
  data,
  selectedAmount,
  setSelectedAmount,
  openVoteModal,
  handleParticipateNormal,
}: any) {
  const safeOptions = data?.options ?? [];
  const myParticipation = data?.myParticipation;

  const isFinished =
    data?.status === "RESOLVED" || data?.status === "REWARDED";


  /* ===============================================================
     2️⃣ 라벨 정규화
     =============================================================== */
  function normalizeLabel(label: any): "YES" | "NO" | "DRAW" | "UNKNOWN" {
    if (!label) return "UNKNOWN";
    const upper = String(label).toUpperCase();
    if (upper.includes("YES")) return "YES";
    if (upper.includes("NO")) return "NO";
    if (upper.includes("DRAW")) return "DRAW";
    return "UNKNOWN";
  }

  /* ===============================================================
     3️⃣ 옵션 가공 (🔥 핵심 로직)
     =============================================================== */
  const processedOptions = safeOptions.map((opt: any) => {
    const optionId = Number(opt.optionId ?? opt.id);
    const correctChoiceId = opt.correctChoiceId ?? null;

    // --- choice 정규화 ---
    const normalizedChoices = (opt.choices ?? []).map((c: any) => {
  const finalChoiceId = Number(c.choiceId ?? c.id);

  return {
    ...c,
    finalChoiceId,
    label: c.choiceText ?? c.text ?? "",
    normalized: normalizeLabel(c.choiceText ?? c.text),
    isCorrect: isFinished && correctChoiceId === finalChoiceId,

    // ✅ 여기만 사용
    odds: typeof c.odds === "number" ? c.odds : 1.0,

    participantsCount: Number(c.participantsCount ?? 0),
  };
});

    // --- option 내부 total 기준 ---
    const total = normalizedChoices.reduce(
      (sum: number, c: any) => sum + c.participantsCount,
      0
    );

    normalizedChoices.forEach((c: any) => {
      c.percent = total
        ? Math.round((c.participantsCount / total) * 100)
        : 0;
    });

    // --- YES / NO / DRAW ---
    const yes = normalizedChoices
      .filter((c: any) => c.normalized === "YES")
      .reduce((a: number, c: any) => a + c.participantsCount, 0);

    const no = normalizedChoices
      .filter((c: any) => c.normalized === "NO")
      .reduce((a: number, c: any) => a + c.participantsCount, 0);

    const draw = normalizedChoices
      .filter((c: any) => c.normalized === "DRAW")
      .reduce((a: number, c: any) => a + c.participantsCount, 0);

    return {
      ...opt,
      optionId,
      optionTitle: opt.optionTitle ?? opt.title,
      choices: normalizedChoices,

      yesP: total ? Math.round((yes / total) * 100) : 0,
      noP: total ? Math.round((no / total) * 100) : 0,
      drawP:
        total && draw > 0
          ? 100 -
            Math.round((yes / total) * 100) -
            Math.round((no / total) * 100)
          : 0,
    };
  });

  /* ===============================================================
     4️⃣ 내 선택
     =============================================================== */
  let myChoice: any = null;

  if (myParticipation?.choiceId) {
    const allChoices = processedOptions.flatMap((o: any) => o.choices);
    myChoice = allChoices.find(
      (c: any) => c.finalChoiceId === myParticipation.choiceId
    );
  }

  const myOption = myChoice
    ? processedOptions.find((o: any) =>
        o.choices.some(
          (c: any) => c.finalChoiceId === myChoice.finalChoiceId
        )
      )
    : null;

  const myChoiceText = myChoice
    ? `${myOption?.optionTitle ?? ""} - ${myChoice.label}`
    : "(선택지 정보 없음)";

  /* ===============================================================
     5️⃣ RENDER
     =============================================================== */
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
      {myParticipation?.hasParticipated && (
        <div className="absolute top-2 right-3 bg-green-600/70 text-white text-xs font-semibold px-2 py-1 rounded-md">
          참여 완료
        </div>
      )}

      <h3 className="text-white font-semibold text-lg">
        {isAIVote ? "포인트 배팅" : "설문 참여하기"}
      </h3>

      {processedOptions.map((opt: any) => (
        <div key={opt.optionId} className="bg-black/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold">{opt.optionTitle}</p>

            <div className="text-xs text-gray-300 flex gap-2">
              <span className="text-green-300">YES {opt.yesP}%</span>
              <span className="text-red-300">NO {opt.noP}%</span>
              {opt.drawP > 0 && (
                <span className="text-gray-300">DRAW {opt.drawP}%</span>
              )}
            </div>
          </div>

          {opt.choices.map((c: any) => {
            const isSelected =
              myParticipation?.choiceId === c.finalChoiceId;

            const color =
              c.normalized === "YES"
                ? "bg-green-600/60 hover:bg-green-600/80"
                : c.normalized === "NO"
                ? "bg-red-600/60 hover:bg-red-600/80"
                : "bg-gray-500/50 hover:bg-gray-500/70";

            return (
              <button
                key={c.finalChoiceId}
                disabled={isFinished}
                onClick={() =>
                  isAIVote
                    ? openVoteModal(c.finalChoiceId)
                    : handleParticipateNormal(c.finalChoiceId)
                }
                className={`
                  w-full flex justify-between items-center
                  rounded-lg px-3 py-3 mb-2 text-sm text-white
                  ${color}
                  ${isSelected ? "ring-2 ring-yellow-400" : ""}
                  ${c.isCorrect ? "ring-2 ring-green-400" : ""}
                  ${isFinished ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <span>{c.label}</span>

                {isAIVote && (
                  <span className="text-xs opacity-80">
                    {c.odds.toFixed(2)}x
                  </span>
                )}

                <span className="text-xs opacity-80">
                  {c.participantsCount}명 ({c.percent}%)
                </span>
              </button>
            );
          })}
        </div>
      ))}

      {/* 포인트 선택 */}
      {isAIVote && !myParticipation?.hasParticipated && !isFinished && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`p-2 rounded-lg text-sm ${
                  selectedAmount === amt
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {amt}pt
              </button>
            ))}
          </div>

          <input
            type="number"
            min={1}
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(Number(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white"
            placeholder="직접 입력"
          />
        </>
      )}

      {isAIVote && myParticipation?.hasParticipated && (
        <div className="mt-4 bg-purple-600/20 border border-purple-400/30 rounded-lg p-3 text-white">
          <div className="font-semibold mb-1 text-sm">내 참여 정보</div>
          <div className="text-sm">
            선택: <b>{myChoiceText}</b>
          </div>
          <div className="text-sm mt-1">
            배팅:{" "}
            <b>{myParticipation.pointsBet?.toLocaleString()} pt</b>
          </div>
        </div>
      )}
    </div>
  );
}
