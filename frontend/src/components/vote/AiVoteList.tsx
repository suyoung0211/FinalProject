import { useState } from "react";
import { VoteItem } from "./VoteItem";

interface AiVoteListProps {
  items: any[];
  onMarketClick: (id: number, type: "AI" | "NORMAL") => void;  // ⭐ FIXED
}

export function AiVoteList({ items, onMarketClick }: AiVoteListProps) {
  const [expanded, setExpanded] = useState(false);

  const firstRow = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div className="space-y-6">

      {/* 기본 3개 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-auto">
        {firstRow.map((issue, index) => (
          <VoteItem
            key={`AI-${issue.id}-${index}`}
            voteId={issue.id}
            onMarketClick={() => onMarketClick(issue.id, "AI")}   // ⭐ FIXED
            initialVote={issue}
          />
        ))}
      </div>

      {/* 펼친 나머지 */}
      {expanded && rest.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-auto">
          {rest.map((issue, index) => (
            <VoteItem
              key={`AI-EX-${issue.id}-${index}`}
              voteId={issue.id}
              onMarketClick={() => onMarketClick(issue.id, "AI")}  // ⭐ FIXED
              initialVote={issue}
            />
          ))}
        </div>
      )}

      {items.length > 3 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
          >
            {expanded ? "접기 ▲" : "더 보기 ▼"}
          </button>
        </div>
      )}
    </div>
  );
}
