import { Button } from "../../components/ui/button";

export function VoteInfoCard({
  data,
  isAIVote,
  isNormalVote,
  isOwner,
  isAdmin,
  setData,
  handleSaveEdit,
}: any) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">

      {/* CATEGORY + EDIT */}
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
          <span className="text-sm text-purple-300 font-medium">
            {data.category}
          </span>
        </div>
      </div>

      {/* TITLE */}
      {isNormalVote && (isOwner || isAdmin) ? (
        <input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg p-2 mb-4"
        />
      ) : (
        <h1 className="text-3xl font-bold text-white mb-4">{data.title}</h1>
      )}

      {/* DESCRIPTION */}
      {isNormalVote && (isOwner || isAdmin) ? (
        <textarea
          value={data.description ?? ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg p-2 mb-6"
        />
      ) : data.description ? (
        <p className="text-gray-300 leading-relaxed mb-6">{data.description}</p>
      ) : null}

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="참여자" value={data.totalParticipants ?? 0} />

        {isAIVote && (
          <StatCard label="총 포인트" value={data.totalPoints ?? 0} />
        )}

        <StatCard label="상태" value={data.status} />

        <StatCard
          label="마감일"
          value={data.endAt ? new Date(data.endAt).toLocaleString() : "-"}
        />
      </div>

      {/* =============================== */}
      {/* 🔥 ADMIN PANEL – 관리자만 보임 */}
      {/* =============================== */}
      {isAdmin && isAIVote && (
        <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <h2 className="text-red-300 font-bold mb-4 text-lg">관리자 패널</h2>

          {/* 정답 선택 */}
          <label className="text-white text-sm mb-2 block">정답 선택</label>

          <select
  value={adminCorrectChoiceId ? String(adminCorrectChoiceId) : ""}
  onChange={(e) => setAdminCorrectChoiceId(Number(e.target.value))}
  className="
      w-full bg-purple-600/40 text-white p-2 rounded-lg mb-4
      border border-purple-400/40
      focus:outline-none focus:ring-2 focus:ring-purple-400
  "
>
  <option value="">정답을 선택하세요</option>

  {parsedOptions.map((c: any) => (
    <option key={c.id} value={String(c.id)} className="text-white bg-purple-700">
      {c.text}
    </option>
  ))}
</select>

          <div className="flex gap-2 flex-wrap">
            <Button
              className="bg-red-600 text-white"
              onClick={() => handleAdminResolve(false)}
            >
              투표 종료
            </Button>

            <Button
              className="bg-orange-500 text-white"
              onClick={() => handleAdminResolve(true)}
            >
              종료 + 정산
            </Button>

            <Button
              className="bg-blue-600 text-white"
              onClick={handleAdminSettleOnly}
            >
              정산만 실행
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
}
