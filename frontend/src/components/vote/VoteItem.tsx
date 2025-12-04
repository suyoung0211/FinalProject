import { useEffect, useState } from "react";
import { User, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { fetchVoteDetail, fetchVoteOdds } from "../../api/voteApi";

interface VoteOptionChoice {
  id: number;
  label: string;
  percentage: number;
}

interface VoteOption {
  id: number;
  label: string;
  choices: VoteOptionChoice[];
}

interface VoteDetailResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  options: VoteOption[];
  totalPoints: number;
  totalParticipants: number;
  endAt: string;
  status: string;
}

export function VoteItem({
  voteId,
  onMarketClick,
}: {
  voteId: number;
  onMarketClick: (id: string) => void;
}) {
  const [vote, setVote] = useState<VoteDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /** 🔥 API로 데이터 가져오기 */
  useEffect(() => {
    async function load() {
      try {
        const detailRes = await fetchVoteDetail(voteId);
        const oddsRes = await fetchVoteOdds(voteId);

        const detail = detailRes.data;
        const odds = oddsRes.data;

        // 🔥 odds 데이터를 detail.options에 매칭
        const mergedOptions = detail.options.map((opt: any) => ({
          ...opt,
          choices: opt.choices.map((c: any) => ({
            ...c,
            percentage: odds[c.id] ?? 0, // 백엔드가 choiceId → percentage 구조로 보내준다고 가정
          })),
        }));

        setVote({
          ...detail,
          options: mergedOptions,
        });
      } catch (e) {
        console.error("VoteItem API 로딩 실패:", e);
      }

      setLoading(false);
    }

    load();
  }, [voteId]);

  if (loading || !vote) {
    return (
      <div className="bg-white/5 p-6 rounded-2xl text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div
      onClick={() => onMarketClick(vote.id.toString())}
      className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
          {vote.category}
        </span>

        <span
          className={`px-3 py-1 text-xs rounded-full ${
            vote.status === "ONGOING"
              ? "bg-green-600/20 text-green-400"
              : "bg-gray-600/20 text-gray-400"
          }`}
        >
          {vote.status === "ONGOING" ? "진행중" : "종료"}
        </span>
      </div>

      <h3 className="text-white font-bold text-lg mb-2">{vote.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{vote.description}</p>

      {/* 옵션 바 그래프 */}
      <div className="space-y-6 mb-4">
        {vote.options?.map((opt) => {
          let yes = opt.choices?.find((c) => c.label === "YES")?.percentage ?? 0;
          let no = opt.choices?.find((c) => c.label === "NO")?.percentage ?? 0;

          const total = yes + no;
          if (total > 0) {
            yes = Math.round((yes / total) * 100);
            no = 100 - yes;
          }

          return (
            <div key={opt.id}>
              <div className="text-white font-semibold text-sm mb-2">
                {opt.label}
              </div>

              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full" style={{ width: `${yes}%` }}></div>
                <div className="bg-red-500 h-full" style={{ width: `${no}%` }}></div>
              </div>

              <div className="flex justify-between mt-1 text-xs">
                <span className="text-green-400">YES {yes}%</span>
                <span className="text-red-400">NO {no}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-gray-400 text-sm border-t border-white/10 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4" />
            <span>{(vote.totalPoints / 1000).toFixed(0)}K P</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{vote.totalParticipants.toLocaleString()}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          마감: {vote.endAt.substring(0, 10)}
        </span>
      </div>

      {/* 버튼 */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onMarketClick(vote.id.toString());
        }}
        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
      >
        투표 참여
      </Button>
    </div>
  );
}
