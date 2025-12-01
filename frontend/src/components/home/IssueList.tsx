import { IssueCard } from "./IssueCard";

export default function IssueList({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((i) => (
        <IssueCard key={i.id} item={i} />
      ))}
    </div>
  );
}
