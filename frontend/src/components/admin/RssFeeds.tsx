// RssFeeds.tsx
export function RssFeeds() {
  const feeds = [
    { id: 1, title: 'Tech News Today', url: 'https://example.com/rss/tech' },
    { id: 2, title: 'Movie Updates', url: 'https://example.com/rss/movie' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">RSS 피드 관리</h2>
      <ul className="space-y-2">
        {feeds.map(feed => (
          <li key={feed.id} className="p-4 bg-white/5 rounded-xl flex justify-between items-center">
            <span>{feed.title}</span>
            <a href={feed.url} target="_blank" className="text-blue-400 underline">보기</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
