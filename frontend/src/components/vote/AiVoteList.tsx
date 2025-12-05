import { useState } from "react";
import { VoteItem } from "./VoteItem";

interface AiVoteListProps {
  items: any[];
  onMarketClick: (id: number) => void;
}

export function AiVoteList({ items, onMarketClick }: AiVoteListProps) {
  const [expanded, setExpanded] = useState(false);

  // 첫 줄: 3개만
  const firstRow = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div className="space-y-6">

      {/* 🔵 기본 1줄(3개) 보여줌 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {firstRow.map((issue, index) => (
          <VoteItem
            key={`AI-${issue.id}-${index}`}
            voteId={issue.id}
            onMarketClick={onMarketClick}
            initialVote={issue}
          />
        ))}
      </div>

      {/* 🔽 펼쳐진 상태에서만 나머지 투표 표시 */}
      {expanded && rest.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {rest.map((issue, index) => (
            <VoteItem
              key={`AI-EX-${issue.id}-${index}`}
              voteId={issue.id}
              onMarketClick={onMarketClick}
              initialVote={issue}
            />
          ))}
        </div>
      )}

      {/* 버튼: 아이템 3개 이하이면 숨김 */}
      {items.length > 3 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="
              px-5 py-2 rounded-xl 
              bg-purple-600 text-white font-semibold
              hover:bg-purple-500 transition
            "
          >
            {expanded ? "접기 ▲" : "더 보기 ▼"}
          </button>
        </div>
      )}
    </div>
  );
}
