// ------------------------------------------------------------
// src/components/articles/LiveSlider.tsx
// ------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function LiveSlider({ articles }: Props) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sliderArticles = articles.filter((a) => !!a.image);

  useEffect(() => {
    if (!sliderArticles.length) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderArticles.length);
    }, 3000);

    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, [sliderArticles]);

  if (!sliderArticles.length) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
          속보
        </span>
        <h2 className="text-2xl font-bold text-white">실시간 뉴스</h2>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-4"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {sliderArticles.map((news) => (
              <div
                key={`live-${news.id}`}
                className="min-w-full md:min-w-[calc(50%-8px)] lg:min-w-[calc(33.333%-11px)]"
              >
                <div
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer h-full"
                  onClick={() => navigate(`/article/${news.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={news.image!}
                        alt={news.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded animate-pulse">
                        속보
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {news.categories.map((c, idx) => (
                        <span
                          key={`live-cat-${news.id}-${idx}`}
                          className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded"
                        >
                          {c}
                        </span>
                      ))}
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded">
                        {news.source}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 hover:text-purple-300 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {news.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{news.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 슬라이더 점 */}
        <div className="flex justify-center gap-2 mt-6">
          {sliderArticles.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? "bg-purple-500 w-8" : "bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
