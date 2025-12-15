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

  /* ---------------------------------------------------------------
      공통 라벨 정규화
  --------------------------------------------------------------- */
  function normalizeLabel(label: any): "YES" | "NO" | "DRAW" | "UNKNOWN" {
    if (!label) return "UNKNOWN";
    const upper = String(label).toUpperCase();
    if (upper.includes("YES")) return "YES";
    if (upper.includes("NO")) return "NO";
    if (upper.includes("DRAW")) return "DRAW";
    return "UNKNOWN";
  }

  /* ---------------------------------------------------------------
      YES / NO / DRAW 통계 계산 (AI + NORMAL 공용)
  --------------------------------------------------------------- */
  const processedOptions = safeOptions.map((opt: any) => {
    const normalizedChoices = opt.choices.map((c: any) => ({
      ...c,
      label: c.choiceText ?? c.text ?? "",
      normalized: normalizeLabel(c.choiceText ?? c.text),
      finalChoiceId: c.choiceId ?? c.id,
    }));

    const yes = normalizedChoices
      .filter((c: any) => c.normalized === "YES")
      .reduce((acc: number, c: any) => acc + (c.participantsCount ?? 0), 0);

    const no = normalizedChoices
      .filter((c: any) => c.normalized === "NO")
      .reduce((acc: number, c: any) => acc + (c.participantsCount ?? 0), 0);

    const draw = normalizedChoices
      .filter((c: any) => c.normalized === "DRAW")
      .reduce((acc: number, c: any) => acc + (c.participantsCount ?? 0), 0);

    const total = yes + no + draw;

    normalizedChoices.forEach((c: any) => {
      c.percent = total ? Math.round((c.participantsCount / total) * 100) : 0;
    });

    return {
      ...opt,
      optionId: opt.optionId ?? opt.id,
      choices: normalizedChoices,
      optionTitle: opt.title ?? opt.optionTitle,
      yes,
      no,
      draw,
      yesP: total ? Math.round((yes / total) * 100) : 0,
      noP: total ? Math.round((no / total) * 100) : 0,
      drawP: total
        ? 100 - Math.round((yes / total) * 100) - Math.round((no / total) * 100)
        : 0,
    };
  });

  // 🔥 디버그 로그
  console.log("🔥 processedOptions:", processedOptions);
  console.log("🔥 myParticipation:", myParticipation);

  /* ---------------------------------------------------------------
      내가 참여한 선택지 찾기 (Fallback 포함)
  --------------------------------------------------------------- */

  let myChoice = null;

  // 1) choiceId 기반 1차 매칭
  if (myParticipation?.choiceId) {
    const allChoices = processedOptions.flatMap((opt: any) => opt.choices);

    myChoice = allChoices.find(
      (c: any) => (c.choiceId ?? c.id) === myParticipation.choiceId
    );
  }

  // 2) fallback: label(Text) 매칭
  if (!myChoice && myParticipation?.choiceText) {
    const allChoices = processedOptions.flatMap((opt: any) => opt.choices);

    myChoice = allChoices.find(
      (c: any) => (c.choiceText ?? c.text) === myParticipation.choiceText
    );
  }

  // 3) 최종 선택지 텍스트
  // 선택한 선택지가 속한 옵션 제목 찾기
let myOptionTitle = null;
if (myChoice) {
  const option = processedOptions.find((opt: any) =>
    opt.choices.some((c: any) => c.finalChoiceId === myChoice.finalChoiceId)
  );
  myOptionTitle = option?.optionTitle ?? null;
}

// 최종 출력 텍스트 조합
const myChoiceText = myOptionTitle
  ? `${myOptionTitle} - ${myChoice?.label}`
  : myChoice?.label ?? "(선택지 정보 없음)";

  /* ---------------------------------------------------------------
      RENDER
  --------------------------------------------------------------- */
  return (
    <div
      className="
      bg-white/5 border border-white/10 rounded-2xl 
      p-4 space-y-4 
      max-h-[calc(100vh-8rem)] 
      overflow-y-auto
    "
    >
      {/* 🔥 참여 완료 라벨 */}
      {myParticipation?.hasParticipated && (
        <div className="absolute top-2 right-3 bg-green-600/70 text-white text-xs font-semibold px-2 py-1 rounded-md">
          참여 완료
        </div>
      )}

      <h3 className="text-white font-semibold text-lg">
        {isAIVote ? "포인트 배팅" : "설문 참여하기"}
      </h3>

      {/* ---------------------------------------------------------------
          옵션 + 선택지 버튼 리스트
      --------------------------------------------------------------- */}
      {processedOptions.map((opt: any) => (
        <div
          key={opt.optionId}
          className="bg-black/30 rounded-xl p-4 border border-white/10 mb-3"
        >
          <p className="text-white font-semibold mb-3">{opt.optionTitle}</p>

          {opt.choices.map((c: any) => {
            const finalChoiceId = c.finalChoiceId;
            const isSelected = myParticipation?.choiceId === finalChoiceId;

            const isFinished =
              data?.status === "FINISHED" ||
              data?.status === "RESOLVED" ||
              data?.status === "REWARDED";

            const color =
              c.normalized === "YES"
                ? "bg-green-600/60 hover:bg-green-600/80"
                : c.normalized === "NO"
                ? "bg-red-600/60 hover:bg-red-600/80"
                : "bg-gray-500/50 hover:bg-gray-500/70";

            return (
              <button
                key={finalChoiceId}
                disabled={isFinished}
                onClick={() =>
                  isAIVote
                    ? setShowVoteModal(finalChoiceId)
                    : handleParticipateNormal(finalChoiceId)
                }
                className={`
                  w-full flex justify-between items-center rounded-lg px-3 py-3 mb-2 text-sm text-white
                  ${color}
                  ${isSelected ? "ring-2 ring-yellow-400 scale-[1.02]" : ""}
                  ${isFinished ? "opacity-40 cursor-not-allowed" : ""}
                `}
              >
                <span>{c.label}</span>

                {isAIVote && c.odds && (
                  <span className="text-xs opacity-80 mr-2">
                    {c.odds.toFixed(2)}x
                  </span>
                )}

                <span className="text-xs opacity-80">
                  {c.participantsCount}명 ({c.percent}%)
                </span>
              </button>
            );
          })}

          {/* Progress Bar */}
          <div className="mt-4 mb-1 text-white font-semibold text-sm opacity-80">
            {opt.optionTitle}
          </div>

          <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/10">
            <div style={{ width: `${opt.yesP}%`, background: "#22c55e" }} />
            <div style={{ width: `${opt.drawP}%`, background: "#9ca3af" }} />
            <div style={{ width: `${opt.noP}%`, background: "#ef4444" }} />
          </div>
        </div>
      ))}

      {/* ---------------------------------------------------------------
          AI Vote 금액 UI
      --------------------------------------------------------------- */}
      {isAIVote && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                className={`
                  p-2 rounded-lg
                  ${
                    selectedAmount === amt
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-gray-300"
                  }
                `}
              >
                {amt}pt
              </button>
            ))}
          </div>

          <input
            type="number"
            value={selectedAmount}
            onChange={(e) =>
              setSelectedAmount(Number(e.target.value) || 0)
            }
            className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white mt-2"
          />

          {/* 내가 참여한 경우 info box */}
          {myParticipation?.hasParticipated && (
            <div className="mt-4 bg-purple-600/20 border border-purple-400/30 rounded-lg p-3 text-white">
              <div className="font-semibold mb-1 text-sm">내 참여 정보</div>

              <div className="text-sm opacity-90">
                선택:{" "}
                <span className="font-bold text-purple-300">
                  {myChoiceText}
                </span>
              </div>

              <div className="text-sm opacity-90 mt-1">
                배팅:{" "}
                <span className="font-bold text-purple-300">
                  {myParticipation.pointsBet?.toLocaleString()} pt
                </span>
              </div>

              {myParticipation.expectedOdds && (
                <div className="text-sm opacity-90 mt-1">
                  예상보상:{" "}
                  <span className="font-bold text-green-300">
                    {(
                      myParticipation.pointsBet *
                      myParticipation.expectedOdds
                    ).toLocaleString()}{" "}
                    pt
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}