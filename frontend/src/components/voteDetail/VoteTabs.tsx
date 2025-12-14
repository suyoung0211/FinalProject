// src/components/voteDetail/VoteTabs.tsx

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { VoteCommentSection } from "../vote/comments/VoteCommentSection";

export function VoteTabs({
  selectedTab,
  setSelectedTab,
  isAIVote,
  chartData,
  data,
  getNormalChoicePercent,
}: any) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">

      <div className="flex border-b border-white/10">
        {["chart", "discussion"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 px-6 py-4 font-medium ${
              selectedTab === tab
                ? "bg-purple-600/30 text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab === "chart"
              ? isAIVote ? "배당 / 차트" : "결과 분포"
              : "토론"}
          </button>
        ))}
      </div>

      <div className="p-6">
        {selectedTab === "chart" ? (
          isAIVote ? (
            <>
              {/* 🔥 배당률 테이블 */}
              {/* 🔥 배당률 테이블 */}
<div className="mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
  {data.odds?.odds?.map((o: any) => {
    const opt = data.options?.find(
      (op: any) => (op.optionId ?? op.id) === o.optionId
    );

    return (
      <div
        key={o.optionId}
        className="flex justify-between py-1 text-gray-200"
      >
        <span>{opt?.optionTitle ?? "옵션"}</span>
        <span className="text-green-300 font-semibold">
          x{o.odds?.toFixed(2)}
        </span>
      </div>
    );
  })}
</div>


              {/* 기존 차트 */}
              <ChartAI chartData={chartData} data={data} />
            </>
          ) : (
            <ChartNormal data={data} getPercent={getNormalChoicePercent} />
          )
        ) : (
          <VoteCommentSection
            targetType={isAIVote ? "VOTE" : "NORMAL"}
            targetId={isAIVote ? data.voteId : data.id}
          />
        )}
      </div>
    </div>
  );
}

function ChartAI({ chartData, data }: any) {
  if (!data?.odds?.odds) {
    return (
      <div className="text-gray-400 text-sm p-4 text-center">
        📉 배당률 정보가 없습니다.
      </div>
    );
  }

  const options = data.options ?? [];
  let finalData = chartData;

  // chartData 없으면 현재 배당률로 단일 데이터 생성
  if (!chartData || chartData.length === 0) {
    const single: Record<string, number> = { count: 1 };

    options.forEach((opt: any) => {
      const odds =
        data.odds.odds.find(
          (o: any) => o.optionId === (opt.optionId ?? opt.id)
        )?.odds ?? 1.0;

      single[opt.optionTitle] = odds;
    });

    finalData = [single];
  }

  return (
    <div className="h-64 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={finalData}>
          <XAxis dataKey="count" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />

          {options.map((opt: any, idx: number) => (
            <Area
              key={opt.optionId}
              type="monotone"
              dataKey={opt.optionTitle}
              stroke={["#22c55e", "#ef4444", "#9ca3af"][idx % 3]}
              fillOpacity={0.2}
              fill={["#22c55e", "#ef4444", "#9ca3af"][idx % 3]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartNormal({ data, getPercent }: any) {
  return (
    <div className="space-y-4">
      {data.options?.map((opt: any) => (
        <div
          key={opt.optionId}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <p className="text-white font-semibold mb-3">{opt.title}</p>

          {opt.choices?.map((ch: any) => {
            const percent = getPercent(ch, opt);
            return (
              <div key={ch.choiceId} className="mb-3">
                
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>{ch.text ?? ch.choiceText}</span>
                  <span>
                    {ch.participantsCount ?? 0}명 ({percent}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
