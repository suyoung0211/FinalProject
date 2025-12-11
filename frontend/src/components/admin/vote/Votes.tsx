// Votes.tsx
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { useState } from "react";

// ✔ 투표 데이터 타입 정의 (실제로 백엔드 연동 시 DTO에 맞춤)
interface VoteType {
  id: number;                     // 투표 식별자
  question: string;               // 투표 질문
  category: string;               // 카테고리
  totalVolume: number;            // 총 거래량 (또는 총 포인트)
  participants: number;           // 참여자 수
  yesVotes: number;               // YES 비율(%)
  noVotes: number;                // NO 비율(%)
  status: "ACTIVE" | "PENDING" | "CLOSED"; // 상태값
}

// ✔ 테이블 Badge 구분 함수
function getStatusBadge(status: VoteType["status"]) {
  switch (status) {
    case "ACTIVE":
      return <span className="text-green-400 font-bold text-sm">진행중</span>;
    case "PENDING":
      return <span className="text-yellow-400 font-bold text-sm">대기</span>;
    case "CLOSED":
      return <span className="text-red-400 font-bold text-sm">종료</span>;
  }
}

export function Votes() {
  // ✔ 목킹 데이터 (나중에 API로 교체)
  const [votes] = useState<VoteType[]>([
    {
      id: 1,
      question: "최신 영화 추천",
      category: "문화",
      totalVolume: 120000,
      participants: 30,
      yesVotes: 65,
      noVotes: 35,
      status: "ACTIVE",
    },
  ]);

  const [showCreateVoteModal, setShowCreateVoteModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* ✔ 기존 admin 테이블 스타일 그대로 재사용 */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col"
             style={{ height: "calc(100vh - 64px)" }}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">투표 목록</h3>
          <Button
            onClick={() => setShowCreateVoteModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            투표 생성
          </Button>
        </div>

        {/* ✔ 테이블 UI */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">질문</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">총 거래량</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">참여자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">YES / NO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">관리</th>
              </tr>
            </thead>

            {/* ✔ 목록 표시 */}
            <tbody className="divide-y divide-white/5">
              {votes.map(vote => (
                <tr key={vote.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{vote.question}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs">
                      {vote.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-yellow-400 font-bold">
                    {vote.totalVolume.toLocaleString()}P
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-bold">
                    {vote.participants}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <span className="text-green-400 font-bold">{vote.yesVotes}%</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-red-400 font-bold">{vote.noVotes}%</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(vote.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
