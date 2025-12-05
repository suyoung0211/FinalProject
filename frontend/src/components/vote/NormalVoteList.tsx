import { NormalVoteItem } from "./NormalVoteItem";

interface NormalVoteListProps {
  items: any[];
  onMarketClick: (id: number) => void;
}

export function NormalVoteList({ items, onMarketClick }: NormalVoteListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {items.map((v, index) => (
        <NormalVoteItem
          key={`NORMAL-${v.id}-${index}`}
          vote={v}
          onMarketClick={onMarketClick}
        />
      ))}
    </div>
  );
}
