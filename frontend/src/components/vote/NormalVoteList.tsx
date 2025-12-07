import { useState } from "react";
import { NormalVoteItem } from "./NormalVoteItem";

interface NormalVoteListProps {
  items: any[];
  onMarketClick: (id: number) => void;
}

export function NormalVoteList({ items, onMarketClick }: NormalVoteListProps) {
  const [expanded, setExpanded] = useState(false);

  // 첫 줄 3개만 보여주기
  const firstRow = items.slice(0, 6);
  const rest = items.slice(3);

  return (
    <div className="space-y-6">

      {/* 🟢 기본 1줄 표시 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {firstRow.map((v, index) => (
          <NormalVoteItem
            key={`NORMAL-${v.id}-${index}`}
            vote={v}
            onMarketClick={onMarketClick}
          />
        ))}
      </div>

      {/* 🔽 펼쳤을 때 나머지 표시 */}
      {expanded && rest.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {rest.map((v, index) => (
            <NormalVoteItem
              key={`NORMAL-EX-${v.id}-${index}`}
              vote={v}
              onMarketClick={onMarketClick}
            />
          ))}
        </div>
      )}

      {/* 버튼 — 3개 이하일 때 숨김 */}
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
