// ------------------------------------------------------------
// src/components/articles/NewsList.tsx
// ------------------------------------------------------------
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function NewsList({ articles }: Props) {
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
              <div className="w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* 카테고리 + 언론사 한 줄 */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex flex-wrap gap-1">
                  {news.categories.map((c, idx) => (
                    <span
                      key={`${news.id}-list-cat-${idx}`}
                      className="px-2 py-0.5 text-[10px] bg-purple-600/30 text-purple-200 rounded-full border border-purple-400/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800/80 border border-white/10 rounded-lg text-gray-200">
                  {news.source}
                </span>
              </div>

              <div>
                <h3 className="text-white font-bold text-base mb-2 line-clamp-2 hover:text-purple-300 transition-colors">
                  {news.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {news.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3" />
                <span>{news.timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
