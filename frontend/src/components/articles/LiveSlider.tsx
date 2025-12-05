// ------------------------------------------------------------
// src/components/articles/LiveSlider.tsx (완전 수정본)
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

  // 최근 40개 + 이미지 있는 기사만
  const sliderArticles = articles.slice(0, 39).filter((a) => !!a.image);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 반응형 카드 표기 개수 계산
  const updateItemsPerPage = () => {
    if (window.innerWidth < 768) setItemsPerPage(1);
    else if (window.innerWidth < 1024) setItemsPerPage(2);
    else setItemsPerPage(3);
  };

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sliderArticles.length / itemsPerPage);

  // 자동 슬라이드
  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (sliderArticles.length > 0) startAutoSlide();
    return () => stopAutoSlide();
  }, [sliderArticles, itemsPerPage]);

  const prevSlide = () => {
    stopAutoSlide();
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
    startAutoSlide();
  };

  const nextSlide = () => {
    stopAutoSlide();
    setCurrentPage((prev) => (prev + 1) % totalPages);
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

      {/* 슬라이드 전체 박스 */}
      <div className="relative overflow-hidden">
        {/* 페이지 전체를 묶는 컨테이너 */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${totalPages * 100}%`,
            transform: `translateX(-${currentPage * (100 / totalPages)}%)`,
          }}
        >
          {/** 각 페이지 생성 */}
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const pageArticles = sliderArticles.slice(
              pageIndex * itemsPerPage,
              pageIndex * itemsPerPage + itemsPerPage
            );

            return (
              <div
                key={pageIndex}
                className="grid gap-4"
                style={{ width: `${100 / totalPages}%` }}
              >
                <div
                  className={`grid gap-4`}
                  style={{
                    gridTemplateColumns: `repeat(${itemsPerPage}, minmax(0, 1fr))`,
                  }}
                >
                  {pageArticles.map((news) => (
                    <div
                      key={news.id}
                      className="bg-white/5 backdrop-blur-xl border border-white/20 
                               rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition"
                      onClick={() => navigate(`/article/${news.id}`)}
                    >
                      <div className="relative">
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>

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
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 버튼 */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 
                     rounded-full backdrop-blur-md border border-white/20 text-white transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 
                     rounded-full backdrop-blur-md border border-white/20 text-white transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 페이지 점 */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentPage ? "bg-purple-500 w-8" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
