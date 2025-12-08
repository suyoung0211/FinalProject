export function VoteSidebarAI({
  yesPercent,
  noPercent,
  selectedAmount,
  setSelectedAmount,
  setShowVoteModal,
  myParticipation,
  options,
}: any) {
  const myChoiceText =
    myParticipation?.choiceId &&
    options
      ?.flatMap((opt: any) => opt.choices)
      ?.find((c: any) => c.choiceId === myParticipation.choiceId)?.text;

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-24 space-y-6">

      <h3 className="text-white font-semibold mb-2">포인트 배팅</h3>

      <button onClick={() => setShowVoteModal("YES")} className="w-full bg-green-600/70 text-white rounded-xl p-4">
        YES — {yesPercent}%
      </button>

      <button onClick={() => setShowVoteModal("NO")} className="w-full bg-red-600/70 text-white rounded-xl p-4">
        NO — {noPercent}%
      </button>

      <div className="grid grid-cols-3 gap-2">
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

      <input
        type="number"
        value={selectedAmount}
        onChange={(e) => setSelectedAmount(Number(e.target.value) || 0)}
        className="w-full bg-white/5 border border-white/20 rounded-lg p-2 text-white"
      />

      {myParticipation?.hasParticipated && (
        <div className="bg-purple-800/40 border border-purple-500/30 rounded-xl p-4 space-y-1 mt-2 text-xs text-gray-300">
          <div>
            <span className="text-gray-400">선택:</span>{" "}
            <span className="text-white font-bold">{myChoiceText ?? "-"}</span>
          </div>
          <div>
            <span className="text-gray-400">배팅:</span> {myParticipation.pointsBet}pt
          </div>
          <div>
            <span className="text-gray-400">예상 배당:</span> {myParticipation.expectedOdds}x
          </div>
        </div>
      )}
    </div>
  );
}
