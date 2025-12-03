import { Clock, ChevronRight, TrendingUp } from "lucide-react";
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
      <div
        className="
          bg-white/5 border border-white/20 backdrop-blur-xl 
          rounded-2xl p-4 sticky top-24 
          max-h-[900px] flex flex-col shadow-lg
        "
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="text-purple-400" />
            많이 본 뉴스
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* 랭킹 리스트 */}
        <div
          className="
            overflow-y-auto pr-2 space-y-4
            custom-scrollbar        
          "
        >
          {articles.map((news, index) => (
            <div
              key={`rank-${news.id}`}
              onClick={() => navigate(`/article/${news.id}`)}
              className="
                group cursor-pointer rounded-xl p-3 transition-all
                bg-white/5 hover:bg-purple-600/20
                border border-transparent hover:border-purple-500/40
              "
            >
              <div className="flex gap-3">
                {/* 랭킹 번호 */}
                <span
                  className="
                    text-2xl font-extrabold 
                    bg-gradient-to-br from-purple-300 to-purple-600 bg-clip-text text-transparent
                    group-hover:scale-110 transition-transform
                  "
                >
                  {index + 1}
                </span>

                {/* 제목 영역 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-purple-200">
                    {news.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{news.timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* 썸네일 */}
              {news.image && (
                <div className="ml-8 mt-2 rounded-lg overflow-hidden">
                  <img
                    src={news.image}
                    className="
                      w-full aspect-video object-cover rounded-xl
                      group-hover:scale-105 transition-transform
                    "
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
