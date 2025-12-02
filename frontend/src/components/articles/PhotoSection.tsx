// ------------------------------------------------------------
// src/components/articles/PhotoSection.tsx
// ------------------------------------------------------------
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function PhotoSection({ articles }: Props) {
  const navigate = useNavigate();
  const items = articles.filter((a) => !!a.image).slice(0, 2);

  if (!items.length) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          포토
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((news) => (
          <div
            key={`photo-${news.id}`}
            className="relative group cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => navigate(`/article/${news.id}`)}
          >
            <div className="aspect-video">
              <img
                src={news.image!}
                alt={news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded">
                    사진
                  </span>
                  <span className="px-2 py-1 bg-black/40 text-white text-xs rounded">
                    {news.source}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                  {news.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
