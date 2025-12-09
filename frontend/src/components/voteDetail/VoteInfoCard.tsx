import { Button } from "../../components/ui/button";

export function VoteInfoCard({
  data,
  isAIVote,
  isNormalVote,
  isOwner,
  isAdmin,
  editMode,
  setEditMode,
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

        {isNormalVote && (isOwner || isAdmin) && (
          <button
            onClick={() => setEditMode((prev: boolean) => !prev)}
            className="ml-auto px-3 py-1 rounded-full text-xs bg-white/10 text-white hover:bg-white/20"
          >
            {editMode ? "수정 종료" : "수정하기"}
          </button>
        )}
      </div>

      {/* TITLE */}
      {editMode && isNormalVote && (isOwner || isAdmin) ? (
        <input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg p-2 mb-4"
        />
      ) : (
        <h1 className="text-3xl font-bold text-white mb-4">{data.title}</h1>
      )}

      {/* DESCRIPTION */}
      {editMode && isNormalVote && (isOwner || isAdmin) ? (
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

      {/* ADMIN PANEL */}
      {isAdmin && isAIVote && data.adminPanel}

      {/* NORMAL 수정 저장 */}
      {editMode && isNormalVote && (isOwner || isAdmin) && (
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setEditMode(false)}>
            취소
          </Button>
          <Button className="bg-purple-600 text-white" onClick={handleSaveEdit}>
            저장
          </Button>
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
