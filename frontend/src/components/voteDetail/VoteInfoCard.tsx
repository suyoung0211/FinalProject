// src/components/voteDetail/VoteInfoCard.tsx

import { Button } from "../../components/ui/button";

export function VoteInfoCard({
  data,
  isAIVote,
  isNormalVote,
  isOwner,
  isAdmin,
  setData,
  handleSaveEdit,

  adminAnswers,
  setAdminAnswers,
  handleAdminResolve,
  handleAdminSettleOnly,
  settlementResult,
}: any) {

  /* ===============================
      옵션별 총 포인트 계산
     =============================== */
  const optionTotalPointsMap: Record<number, number> = {};

  data.options?.forEach((opt: any) => {
    const optionId = opt.optionId ?? opt.id;
    optionTotalPointsMap[optionId] =
      opt.choices?.reduce(
        (sum: number, c: any) => sum + (c.pointsTotal ?? 0),
        0
      ) ?? 0;
  });
  

  /* ===============================
      최대 배당률 (choice 기준)
     =============================== */
  const maxOdds = isAIVote
  ? Math.max(
      ...(
        data?.options
          ?.flatMap((opt: any) => opt.choices ?? [])
          ?.map((c: any) => c.odds ?? 0) ?? [0]
      )
    )
  : null;

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">

      {/* ARTICLE */}
      {data.article?.thumbnailUrl && (
        <div className="w-full rounded-xl overflow-hidden mb-4">
          <img
            src={data.article.thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-[260px] object-cover"
          />
        </div>
      )}

      {/* CATEGORY */}
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
          <span className="text-sm text-purple-300 font-medium">
            {data.category}
          </span>
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-lg font-bold text-white mb-3">
        {data.title}
      </h1>

      {data.description && (
        <p className="text-gray-300 leading-relaxed mb-6">
          {data.description}
        </p>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="참여자" value={data.totalParticipants ?? 0} />

        {isAIVote && (
          <StatCard
            label="총 포인트"
            value={Object.values(optionTotalPointsMap).reduce(
              (a: number, b: number) => a + b,
              0
            )}
          />
        )}

        {isAIVote ? (
          <StatCard
            label="최대 배당률"
            value={maxOdds ? `x${maxOdds.toFixed(2)}` : "-"}
          />
        ) : (
          <StatCard label="상태" value={data.status} />
        )}

        <StatCard
  label="마감일"
  value={
    data.endAt
      ? new Date(data.endAt)
          .toISOString()
          .slice(0, 10)
          .replaceAll("-", "/")
      : "-"
  }
/>
      </div>

      {/* ===============================
          ADMIN PANEL
         =============================== */}
      {isAdmin && isAIVote && (
        <div className="mt-10 p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <h2 className="text-red-300 font-bold mb-4 text-lg">
            관리자 패널
          </h2>

          {data.options.map((opt: any) => {
            const optionId = opt.optionId ?? opt.id;
            const optionTotal = optionTotalPointsMap[optionId];

            return (
              <div key={optionId} className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white font-semibold mb-2">
                  {opt.optionTitle ?? opt.title}
                </p>

                <p className="text-xs text-gray-400 mb-2">
                  옵션 총 포인트: {optionTotal.toLocaleString()} pt
                </p>

                {opt.choices.map((c: any) => {
                  const choiceId = c.choiceId ?? c.id;
                  const choicePoints = c.pointsTotal ?? 0;

                  const probability = optionTotal
                    ? (choicePoints / optionTotal) * 100
                    : 0;

                  const currentOdds =
                  data.odds?.odds?.find(
                  (o: any) => o.optionId === optionId
                  )?.odds ?? null;

                  return (
                    <label
                      key={choiceId}
                      className="flex items-center justify-between gap-3 mb-1 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`option-${optionId}`}
                          checked={adminAnswers?.[optionId] === choiceId}
                          onChange={() =>
                            setAdminAnswers((prev: any) => ({
                              ...prev,
                              [optionId]: choiceId,
                            }))
                          }
                        />
                        <span>{c.text ?? c.choiceText}</span>
                      </div>

                      <div className="text-xs text-gray-300">
                        {probability.toFixed(1)}% ·
                        {currentOdds ? ` x${currentOdds.toFixed(2)}` : " -"}
                      </div>
                    </label>
                  );
                })}
              </div>
            );
          })}

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              className="bg-red-600 text-white"
              disabled={data.status !== "ONGOING"}
              onClick={() => handleAdminResolve(false)}
            >
              투표 종료
            </Button>

            <Button
              className="bg-orange-500 text-white"
              disabled={data.status !== "ONGOING"}
              onClick={() => handleAdminResolve(true)}
            >
              종료 + 정산
            </Button>

            <Button
              className="bg-blue-600 text-white"
              disabled={data.status !== "RESOLVED"}
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
