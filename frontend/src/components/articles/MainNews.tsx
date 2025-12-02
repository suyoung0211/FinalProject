// ------------------------------------------------------------
// src/components/articles/MainNews.tsx
// ------------------------------------------------------------
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  article: Article;
}

export default function MainNews({ article }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
      onClick={() => navigate(`/article/${article.id}`)}
    >
      {article.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-6 space-y-3">
        {/* 카테고리 + 언론사 한 줄 */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex flex-wrap gap-2">
            {article.categories.map((c, idx) => (
              <span
                key={`${article.id}-main-cat-${idx}`}
                className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded-full border border-purple-400/40"
              >
                {c}
              </span>
            ))}
          </div>
          <span className="text-xs px-2 py-1 bg-slate-800/80 border border-white/10 rounded-lg text-gray-200">
            {article.source}
          </span>
        </div>

        <h2 className="text-3xl font-bold text-white mb-1 hover:text-purple-300 transition-colors">
          {article.title}
        </h2>
        <p className="text-gray-300 text-base line-clamp-3">{article.summary}</p>

        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <Clock className="w-4 h-4" />
          <span>{article.timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
