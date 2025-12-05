import { VoteItem } from "./VoteItem";

export function VoteList({
  items,
  onMarketClick,
}: {
  items: any[];
  onMarketClick: (id: number) => void;
}) {
  console.log("🟣 [FRONT] VoteList items =", items);   // ⭐ 디버그 추가
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {items.map((issue) => (
        <VoteItem
          key={issue.id}
          voteId={issue.id}
          onMarketClick={onMarketClick}
        />
      ))}
      
    </div>
  );
}
