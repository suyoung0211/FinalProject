export function VoteSidebarNormal({ options, onParticipate }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 space-y-4">
      <h3 className="text-white font-semibold">설문 참여하기</h3>

      {options?.map((opt: any) => (
        <div key={opt.optionId} className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-white font-semibold mb-3">{opt.optionTitle}</p>

          {opt.choices?.map((ch: any) => (
            <button
              key={ch.choiceId}
              onClick={() => onParticipate(opt.optionId, ch.choiceId)}
              className="w-full flex justify-between items-center bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm"
            >
              <span>{ch.choiceText}</span>
              <span className="text-xs text-gray-300">{ch.participantsCount ?? 0}명</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
