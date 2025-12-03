interface NewsItem {
  articleId: number;
  title: string;
  aiTitle?: string | null;   // ← null 허용
  thumbnail?: string | null; // ← null 허용
  publishedAt: string;
  categories?: string[];
}

interface LatestNewsListProps {
  items: NewsItem[];
}

export default function LatestNewsList({ items }: LatestNewsListProps) {
  if (!items || items.length === 0)
    return <div className="text-gray-400">표시할 이슈가 없습니다.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
      {items.map((news: NewsItem) => (
        <div
          key={news.articleId}
          className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur hover:bg-white/10 transition cursor-pointer"
        >
          <div className="flex gap-4">
            <img
              src={news.thumbnail || "/no_img.png"}
              alt=""
              className="w-32 h-24 object-cover rounded-lg"
            />

            <div className="flex-1">
              <h3 className="text-white font-semibold line-clamp-2 mb-2">
                {news.aiTitle || news.title}
              </h3>

              <p className="text-xs text-gray-400">
                {new Date(news.publishedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
  {news.categories?.map((c: string) => (
    <span
      key={c}
      onClick={() => window.location.href = `/article?category=${c}`}
      className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full cursor-pointer hover:bg-purple-500/40"
    >
      {c}
    </span>
  ))}
</div>
        </div>
      ))}
    </div>
  );
}