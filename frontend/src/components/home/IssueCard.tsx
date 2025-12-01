export function IssueCard({ item }: { item: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer">
      <h3 className="text-white font-semibold">{item.title}</h3>
      {item.aiTitle && (
        <p className="text-purple-300 text-sm">{item.aiTitle}</p>
      )}
      {item.thumbnail && (
        <img src={item.thumbnail} className="w-full rounded-lg mt-3" />
      )}
    </div>
  );
}
