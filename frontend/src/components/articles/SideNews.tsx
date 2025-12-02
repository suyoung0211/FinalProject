// ------------------------------------------------------------
// src/components/articles/SideNews.tsx
// ------------------------------------------------------------
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function SideNews({ articles }: Props) {
  const navigate = useNavigate();

  if (!articles.length) return null;

  return (
    <div className="space-y-4">
      {articles.map((news) => (
        <div
          key={news.id}
          onClick={() => navigate(`/article/${news.id}`)}
          className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex gap-3 p-4">
            {news.image && (
              <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* 카테고리 + 언론사 한 줄 */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex flex-wrap gap-1">
                  {news.categories.map((c, idx) => (
                    <span
                      key={`${news.id}-side-cat-${idx}`}
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

              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 hover:text-purple-300 transition-colors">
                {news.title}
              </h3>
              <p className="text-gray-400 text-xs line-clamp-2">{news.summary}</p>

              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
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
