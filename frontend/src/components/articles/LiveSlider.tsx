// ------------------------------------------------------------
// src/components/articles/LiveSlider.tsx
// ------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../pages/ArticleListPage";

interface Props {
  articles: Article[];
}

export default function LiveSlider({ articles }: Props) {
  const navigate = useNavigate();

  // ⭐ 슬라이드 기사 개수 제한 (최근 40개)
  const sliderArticles = articles.slice(0, 40).filter((a) => !!a.image);

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderArticles.length);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (sliderArticles.length > 0) {
      startAutoSlide();
    }
    return () => stopAutoSlide();
  }, [sliderArticles]);

  const prevSlide = () => {
    stopAutoSlide();
    setCurrentSlide((prev) =>
      prev === 0 ? sliderArticles.length - 1 : prev - 1
    );
    startAutoSlide();
  };

  const nextSlide = () => {
    stopAutoSlide();
    setCurrentSlide((prev) => (prev + 1) % sliderArticles.length);
    startAutoSlide();
  };

  if (!sliderArticles.length) return null;

  return (
    <div className="mt-16 relative">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
          속보
        </span>
        <h2 className="text-2xl font-bold text-white">실시간 뉴스</h2>
      </div>

      {/* 슬라이드 컨테이너 */}
      <div className="relative overflow-hidden">

        {/* 카드 리스트 */}
        <div
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {sliderArticles.map((news) => (
            <div
              key={news.id}
              className="min-w-full md:min-w-[calc(50%-8px)] lg:min-w-[calc(33.333%-11px)]"
            >
              <div
                onClick={() => navigate(`/article/${news.id}`)}
                className="bg-white/5 backdrop-blur-xl border border-white/20 
                           rounded-xl overflow-hidden h-full cursor-pointer hover:bg-white/10
                           transition-all"
              >
                <div className="relative">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* 카테고리/출처 */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {news.categories.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded"
                      >
                        {c}
                      </span>
                    ))}
                    <span className="px-2 py-1 bg-black/60 text-white text-xs rounded">
                      {news.source}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 hover:text-purple-300 transition">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {news.timeAgo}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 왼쪽 버튼 */}
        <button
          onClick={prevSlide}
          className="
            absolute left-2 top-1/2 -translate-y-1/2 
            z-20 p-2 rounded-full
            bg-black/40 hover:bg-black/60 backdrop-blur-md 
            border border-white/20 text-white transition
          "
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 오른쪽 버튼 */}
        <button
          onClick={nextSlide}
          className="
            absolute right-2 top-1/2 -translate-y-1/2 
            z-20 p-2 rounded-full
            bg-black/40 hover:bg-black/60 backdrop-blur-md 
            border border-white/20 text-white transition
          "
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 슬라이드 점 */}
      <div className="flex justify-center gap-2 mt-6">
        {sliderArticles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              stopAutoSlide();
              setCurrentSlide(idx);
              startAutoSlide();
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentSlide ? "bg-purple-500 w-8" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
