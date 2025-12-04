import { VoteItem } from "./VoteItem";

export function VoteList({
  items,
  onMarketClick,
}: {
  items: any[];
  onMarketClick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {items.map(issue => (
  <VoteItem voteId={issue.id} onMarketClick={onMarketClick} />
))}
    </div>
  );
}
