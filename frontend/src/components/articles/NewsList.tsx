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
    <div className="lg:col-span-3 space-y-5">
      {articles.map((news) => (
        <div
          key={news.id}
          onClick={() => navigate(`/article/${news.id}`)}
          className="
            flex gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20
            hover:bg-purple-600/10 hover:border-purple-500/40 cursor-pointer transition-all
            shadow-sm hover:shadow-purple-500/30
          "
        >
          {news.image && (
            <div className="w-40 h-28 rounded-xl overflow-hidden">
              <img
                src={news.image}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
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

            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 hover:text-purple-300 transition">
              {news.title}
            </h3>

            <p className="text-gray-400 text-sm line-clamp-2">{news.summary}</p>

            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              <Clock className="w-3 h-3" />
              <span>{news.timeAgo}</span>
            </div>
          </div>
        </div>
      ))}

      {visibleCount < totalCount && (
        <button
          onClick={() => setVisibleCount(visibleCount + 10)}
          className="
            w-full py-3 mt-4 bg-purple-600/40 hover:bg-purple-600/60 
            text-white rounded-xl border border-purple-400/30 transition
          "
        >
          더 보기
        </button>
      )}
    </div>
  );
}
