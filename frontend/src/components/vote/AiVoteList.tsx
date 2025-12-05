import { VoteItem } from "./VoteItem";

interface AiVoteListProps {
  items: any[];
  onMarketClick: (id: number) => void;
}

export function AiVoteList({ items, onMarketClick }: AiVoteListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {items.map((issue, index) => (
        <VoteItem
          key={`AI-${issue.id}-${index}`}
          voteId={issue.id}
          onMarketClick={onMarketClick}
          initialVote={issue}
        />
      ))}
    </div>
  );
}