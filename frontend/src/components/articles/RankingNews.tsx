// ------------------------------------------------------------
// RankingNews.tsx (슬라이드당 5개 + 번호 연속 + 반응형 sticky 버전)
// ------------------------------------------------------------
import {
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function RankingNews({ articles }: Props) {
  const navigate = useNavigate();

  // 상위 21개만 사용
  const limitedArticles = articles.slice(0, 30);

  // 슬라이드당 표시 개수
  const PAGE_SIZE = 6;

  // 전체 슬라이드 수
  const totalSlides = Math.ceil(limitedArticles.length / PAGE_SIZE);

  const [index, setIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goPrev = () => {
    resetTimer();
    setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goNext = () => {
    resetTimer();
    setIndex((prev) => (prev + 1) % totalSlides);
  };

  if (!limitedArticles.length) return null;

  return (
    <div
      className="
        sticky top-24 
        w-full
        bg-white/5 backdrop-blur-xl 
        border border-white/20 
        rounded-2xl p-4 shadow-lg 
        z-10
      "
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <TrendingUp className="text-purple-400" />
          많이 본 뉴스
        </h3>

        <div className="flex gap-2">
          <button
            onClick={goPrev}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={goNext}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const slideItems = limitedArticles.slice(
              slideIndex * PAGE_SIZE,
              slideIndex * PAGE_SIZE + PAGE_SIZE
            );

            return (
              <div key={slideIndex} className="w-full shrink-0 px-1">
                {slideItems.map((news, i) => {
                  const rank = slideIndex * PAGE_SIZE + i + 1; // ← 번호 1~N 자동 생성

                  return (
                    <div
                      key={`rank-${news.id}`}
                      onClick={() => navigate(`/article/${news.id}`)}
                      className="
                        group cursor-pointer rounded-xl p-3 mb-4
                        bg-white/5 hover:bg-purple-600/20
                        border border-transparent hover:border-purple-500/40
                        transition-all
                      "
                    >
                      <div className="flex gap-3">
                        <span
                          className="
                            text-2xl font-extrabold 
                            bg-gradient-to-br from-purple-300 to-purple-600
                            bg-clip-text text-transparent
                            group-hover:scale-110 transition-transform
                          "
                        >
                          {rank}
                        </span>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-purple-200">
                            {news.title}
                          </h4>

                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            {news.timeAgo}
                          </div>
                        </div>
                      </div>

                      {news.image && (
                        <img
                          src={news.image}
                          className="
                            mt-3 w-full 
                            aspect-video object-cover rounded-lg
                          "
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
