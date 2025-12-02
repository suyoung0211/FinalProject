// ------------------------------------------------------------
// src/components/articles/RankingNews.tsx
// ------------------------------------------------------------
import { Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function RankingNews({ articles }: Props) {
  const navigate = useNavigate();

  if (!articles.length) return null;

  return (
    <div className="lg:col-span-1">
      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sticky top-24">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <h3 className="text-white font-bold text-lg">많이 본 뉴스</h3>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {articles.map((news, index) => (
            <div
              key={`rank-${news.id}`}
              onClick={() => navigate(`/article/${news.id}`)}
              className="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all"
            >
              <div className="flex gap-3 mb-1">
                <span className="text-xl font-bold text-purple-400">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium line-clamp-2">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{news.timeAgo}</span>
                  </div>
                </div>
              </div>
              {news.image && (
                <div className="ml-8 rounded-lg overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
