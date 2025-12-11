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
              <div className="mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
                {data.odds?.odds?.map((o: any) => (
                  <div key={o.choiceId} className="flex justify-between py-1 text-gray-200">
                    <span>{o.text}</span>
                    <span className="text-green-300 font-semibold">
                      x{o.odds?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 기존 차트 */}
              <ChartAI chartData={chartData} />
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

function ChartAI({ chartData }: any) {
  return (
    <div className="h-64 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Area type="monotone" dataKey="yes" stroke="#22c55e" strokeWidth={2} fillOpacity={0.3} fill="#22c55e" />
          <Area type="monotone" dataKey="no" stroke="#ef4444" strokeWidth={2} fillOpacity={0.3} fill="#ef4444" />
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
