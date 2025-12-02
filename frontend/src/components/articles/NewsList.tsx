// ------------------------------------------------------------
// src/components/articles/NewsList.tsx
// ------------------------------------------------------------
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
  visibleCount: number;
  setVisibleCount: (v: number) => void;
  totalCount: number;
}

export default function NewsList({
  articles,
  visibleCount,
  setVisibleCount,
  totalCount,
}: Props) {
  const navigate = useNavigate();

  if (!articles.length) return null;

  return (
    <div className="lg:col-span-3 space-y-4">
      {articles.map((news) => (
        <div
          key={news.id}
          onClick={() => navigate(`/article/${news.id}`)}
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex gap-4 p-4">
            {news.image && (
              <div className="w-40 h-28 rounded-lg overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {news.categories.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] bg-purple-600/30 text-purple-200 rounded-full border border-purple-400/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-gray-200 rounded-lg">
                  {news.source}
                </span>
              </div>

              <h3 className="text-white font-bold text-base line-clamp-2">
                {news.title}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">
                {news.summary}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3" />
                <span>{news.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ⭐ 10개씩 더 보기 버튼 */}
      {visibleCount < totalCount && (
        <button
          onClick={() => setVisibleCount(visibleCount + 10)}
          className="w-full py-3 mt-4 bg-purple-600/40 hover:bg-purple-600/60 text-white rounded-xl border border-purple-400/30 transition"
        >
          더 보기
        </button>
      )}
    </div>
  );
}
