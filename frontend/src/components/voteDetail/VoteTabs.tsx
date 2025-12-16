import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import { VoteCommentSection } from "../vote/comments/VoteCommentSection";

/* =========================================================
   VoteTabs
   chartData = [
     {
       optionId,
       optionTitle,
       chart: [{ step, YES, NO, DRAW }]
     }
   ]
   ========================================================= */
export function VoteTabs({
  selectedTab,
  setSelectedTab,
  isAIVote,
  chartData,
  data,
  getNormalChoicePercent,
}: any) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  /** ✅ 최초 옵션 자동 선택 */
  useEffect(() => {
    if (
      isAIVote &&
      selectedOptionId == null &&
      Array.isArray(chartData) &&
      chartData.length > 0
    ) {
      setSelectedOptionId(chartData[0].optionId);
    }
  }, [chartData, isAIVote, selectedOptionId]);

  const selectedOption = Array.isArray(chartData)
    ? chartData.find((o: any) => o.optionId === selectedOptionId)
    : null;

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
      {/* ================= TAB HEADER ================= */}
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
              ? isAIVote
                ? "배당 / 차트"
                : "결과 분포"
              : "토론"}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-6">
        {selectedTab === "chart" ? (
          isAIVote ? (
            <>
              {/* ===== 옵션 선택 ===== */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {Array.isArray(chartData) &&
                  chartData.map((opt: any) => (
                    <button
                      key={opt.optionId}
                      onClick={() => setSelectedOptionId(opt.optionId)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        selectedOptionId === opt.optionId
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {opt.optionTitle ?? `옵션 ${opt.optionId}`}
                    </button>
                  ))}
              </div>

              {/* ===== 차트 ===== */}
              {selectedOption?.chart ? (
                <ChartAI chartData={selectedOption.chart} />
              ) : (
                <div className="text-gray-400 text-sm text-center py-8">
                  📉 차트 데이터가 없습니다
                </div>
              )}
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
const getChoiceColorClass = (text: string) => {
  const t = text?.toUpperCase();

  if (t === "YES") return "bg-green-500";
  if (t === "NO") return "bg-red-500";
  if (t === "DRAW") return "bg-gray-400";

  return "bg-purple-500"; // 예외 대비
};
/* =========================================================
   AI Vote Chart
   chartData = [{ step, YES, NO, DRAW }]
   ========================================================= */
function ChartAI({ chartData }: any) {
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className="text-gray-400 text-sm p-4 text-center">
        📉 배당률 히스토리가 없습니다.
      </div>
    );
  }

  const keys = Object.keys(chartData[0]).filter(
    (k) => k !== "step"
  );

  const colors: Record<string, string> = {
    YES: "#22c55e",
    NO: "#ef4444",
    DRAW: "#9ca3af",
  };

  

  return (
    <div className="h-64 mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <XAxis
            dataKey="step"
            stroke="#aaa"
            tickFormatter={(v) => `참여 ${v}`}
          />
          <YAxis stroke="#aaa" domain={[1, 10]} />
          <Tooltip content={<CustomTooltip />} />

          {keys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key] ?? "#8884d8"}
              fill={colors[key] ?? "#8884d8"}
              fillOpacity={0.25}
              name={key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =========================================================
   Tooltip
   ========================================================= */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-xs text-white">
      <div className="font-semibold mb-1">참여자 {label}명</div>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex justify-between gap-4"
          style={{ color: p.color }}
        >
          <span>{p.dataKey}</span>
          <span>x{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Normal Vote Chart (기존 유지)
   ========================================================= */
function ChartNormal({ data }: any) {
  return (
    <div className="space-y-4">
      {data.options?.map((opt: any) => {
        const total = opt.choices?.reduce(
          (sum: number, c: any) => sum + Number(c.participantsCount ?? 0),
          0
        );

        return (
          <div
            key={opt.optionId}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <p className="text-white font-semibold mb-3">{opt.title}</p>

            {opt.choices?.map((ch: any) => {
              const count = Number(ch.participantsCount ?? 0);
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              const label = ch.text ?? ch.choiceText;

              return (
                <div key={ch.choiceId} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{label}</span>
                    <span>
                      {count}명 ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getChoiceColorClass(label)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}